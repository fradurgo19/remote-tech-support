import { Request, Response } from 'express';
import Report from '../models/Report';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { createTransport } from 'nodemailer';
import PDFDocument from 'pdfkit';

// Configuración del almacenamiento de archivos
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const REPORTS_DIR = path.join(UPLOADS_DIR, 'reports');

// Asegurarse de que los directorios existan
(async () => {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(REPORTS_DIR, { recursive: true });
})();

// Configuración del cliente de correo
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const reportController = {
  // Crear un nuevo informe
  async create(req: Request, res: Response) {
    try {
      const { title, description } = req.body;
      const userId = req.user?.id; // Asumiendo que tienes middleware de autenticación

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Manejar archivos adjuntos
      const attachments: string[] = [];
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const fileName = `${uuidv4()}-${file.originalname}`;
          const filePath = path.join(REPORTS_DIR, fileName);
          await fs.writeFile(filePath, file.buffer);
          attachments.push(fileName);
        }
      }

      const report = await Report.create({
        title,
        description,
        attachments,
        userId,
      });

      res.status(201).json(report);
    } catch (error) {
      console.error('Error al crear el informe:', error);
      res.status(500).json({ error: 'Error al crear el informe' });
    }
  },

  // Obtener todos los informes
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const reports = await Report.findAll({
        order: [['createdAt', 'DESC']],
      });

      res.json(reports);
    } catch (error) {
      console.error('Error al obtener los informes:', error);
      res.status(500).json({ error: 'Error al obtener los informes' });
    }
  },

  // Generar PDF del informe
  async generatePDF(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const report = await Report.findOne({
        where: { id: reportId, userId },
      });

      if (!report) {
        return res.status(404).json({ error: 'Informe no encontrado' });
      }

      const doc = new PDFDocument();
      const pdfPath = path.join(REPORTS_DIR, `${report.id}.pdf`);

      // Configurar el stream de escritura
      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      // Agregar contenido al PDF
      doc.fontSize(20).text(report.title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Fecha: ${report.createdAt.toLocaleDateString()}`);
      doc.moveDown();
      doc.fontSize(12).text(report.description);
      doc.moveDown();

      if (report.attachments.length > 0) {
        doc.fontSize(14).text('Archivos adjuntos:');
        report.attachments.forEach(attachment => {
          doc.fontSize(12).text(`- ${attachment}`);
        });
      }

      // Finalizar el PDF
      doc.end();

      // Esperar a que se complete la escritura
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      res.json({ pdfPath: `${report.id}.pdf` });
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      res.status(500).json({ error: 'Error al generar el PDF' });
    }
  },

  // Enviar informe por correo
  async sendEmail(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const { email } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const report = await Report.findOne({
        where: { id: reportId, userId },
      });

      if (!report) {
        return res.status(404).json({ error: 'Informe no encontrado' });
      }

      // Generar el PDF
      const pdfPath = path.join(REPORTS_DIR, `${report.id}.pdf`);
      await this.generatePDF(req, res);

      // Enviar el correo
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `Informe de Soporte: ${report.title}`,
        text: `Adjunto encontrarás el informe de soporte "${report.title}".`,
        attachments: [
          {
            filename: `${report.title}.pdf`,
            path: pdfPath,
          },
        ],
      });

      res.json({ message: 'Informe enviado exitosamente' });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      res.status(500).json({ error: 'Error al enviar el correo' });
    }
  },
}; 