import { Request, Response } from 'express';
import Report from '../models/Report';
import { createTransport } from 'nodemailer';
import PDFDocument from 'pdfkit';
import { storageService } from '../services/storage.service';

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
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);
      
      const { title, description } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        console.log('No user ID found in request');
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      console.log('Creating report with data:', { title, description, userId });

      // Manejar archivos adjuntos con Supabase Storage
      const attachments: Array<{
        url: string;
        path: string;
        filename: string;
        size: number;
        mimeType: string;
      }> = [];
      if (req.files && Array.isArray(req.files)) {
        console.log('Processing files:', req.files);
        
        // Crear el reporte primero para obtener su ID
        const tempReport = await Report.create({
          title,
          description,
          attachments: '[]', // JSON string vacío temporalmente
          authorId: userId,
          type: req.body.type || 'technical',
          status: req.body.status || 'draft',
          priority: req.body.priority || 'medium'
        });

        // Subir archivos a Supabase Storage
        for (const file of req.files as Express.Multer.File[]) {
          try {
            console.log(`📤 Subiendo archivo a Supabase (report-attachments): ${file.originalname}`);
            const uploadResult = await storageService.uploadReportAttachment(
              tempReport.id,
              file
            );
            attachments.push(uploadResult);
            console.log(`✅ Archivo subido a Supabase: ${uploadResult.url}`);
          } catch (uploadError) {
            console.error('❌ Error al subir archivo a Supabase:', uploadError);
          }
        }

        // Actualizar el reporte con los attachments
        await tempReport.update({
          attachments: JSON.stringify(attachments)
        });

        console.log('Report created successfully:', tempReport.toJSON());
        return res.status(201).json({
          message: 'Informe creado exitosamente',
          report: tempReport
        });
      } else {
        console.log('No files found in request');
      }

      console.log('Creating report with attachments:', attachments);

      const report = await Report.create({
        title,
        description,
        attachments,
        authorId: userId,
        type: req.body.type || 'technical',
        status: req.body.status || 'draft',
        priority: req.body.priority || 'medium'
      });

      console.log('Report created successfully:', report.toJSON());
      res.status(201).json({
        message: 'Informe creado exitosamente',
        report
      });
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

  // Descargar archivo adjunto
  async downloadAttachment(req: Request, res: Response) {
    try {
      const { reportId, fileName } = req.params;
      const userId = req.user?.id;

      console.log('Download request:', { reportId, fileName, userId });

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const report = await Report.findOne({
        where: { id: reportId },
      });

      console.log('Report found:', report ? 'Yes' : 'No');
      if (report) {
        console.log('Report attachments:', report.attachments);
      }

      if (!report) {
        return res.status(404).json({ error: 'Informe no encontrado' });
      }

      if (!report.attachments || !report.attachments.includes(fileName)) {
        console.log('File not found in attachments:', fileName);
        return res.status(404).json({ error: 'Archivo no encontrado' });
      }

      const filePath = path.join(REPORTS_DIR, fileName);
      console.log('File path:', filePath);
      console.log('File exists:', fs.existsSync(filePath));

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
      }

      res.download(filePath);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      res.status(500).json({ error: 'Error al descargar el archivo' });
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
        where: { id: reportId },
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

      res.download(pdfPath, `${report.title}.pdf`);
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
        where: { id: reportId },
      });

      if (!report) {
        return res.status(404).json({ error: 'Informe no encontrado' });
      }

      // Generar el PDF
      const pdfPath = path.join(REPORTS_DIR, `${report.id}.pdf`);
      const doc = new PDFDocument();
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

  // Eliminar informe
  async delete(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const report = await Report.findOne({
        where: { id: reportId },
      });

      if (!report) {
        return res.status(404).json({ error: 'Informe no encontrado' });
      }

      // Verificar que el usuario sea el autor del informe o un administrador
      if (report.authorId !== userId) {
        // Aquí podrías agregar lógica para verificar si es administrador
        return res.status(403).json({ error: 'No tienes permisos para eliminar este informe' });
      }

      // Eliminar archivos adjuntos del servidor
      if (report.attachments && report.attachments.length > 0) {
        for (const attachment of report.attachments) {
          const filePath = path.join(REPORTS_DIR, attachment);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      // Eliminar PDF si existe
      const pdfPath = path.join(REPORTS_DIR, `${report.id}.pdf`);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }

      // Eliminar el informe de la base de datos
      await report.destroy();

      res.json({ message: 'Informe eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar el informe:', error);
      res.status(500).json({ error: 'Error al eliminar el informe' });
    }
  },
}; 