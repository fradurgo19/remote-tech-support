import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { Ticket, User } from '../models';
import { logger } from '../utils/logger';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../../.env') });

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface TicketEmailData {
  ticket: Ticket;
  customer: User;
  technician?: User;
}

export interface TicketStatusChangeData {
  ticket: Ticket;
  customer: User;
  technician?: User;
  oldStatus: string;
  newStatus: string;
}

export interface TechnicianAssignmentData {
  ticket: Ticket;
  customer: User;
  technician: User;
  isReassignment: boolean;
  previousTechnician?: User;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private supportEmail: string = 'soportemq@partequipos.com';
  private additionalSupportEmail: string = 'scalderon@partequipos.com';
  private managementEmail: string = 'jestrada@partequipos.com';
  private logoUrl: string = 'https://res.cloudinary.com/dbufrzoda/image/upload/v1750457354/Captura_de_pantalla_2025-06-20_170819_wzmyli.png';
  private initialized: boolean = false;

  constructor() {
    // Inicializar de forma diferida para asegurar que las variables de entorno estén cargadas
    setTimeout(() => {
      this.initializeTransporter();
    }, 1000);
  }

  private initializeTransporter() {
    try {
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      };

      logger.info('Initializing email service with config:', {
        host: emailConfig.host,
        port: emailConfig.port,
        user: emailConfig.auth.user,
        hasPassword: !!emailConfig.auth.pass,
      });

      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        logger.warn(
          'Email configuration incomplete. Email notifications will be disabled.'
        );
        this.initialized = false;
        return;
      }

      this.transporter = nodemailer.createTransport(emailConfig);
      this.initialized = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.transporter = null;
      this.initialized = false;
    }
  }

  private async ensureInitialized(): Promise<boolean> {
    if (!this.initialized) {
      logger.warn(
        'Email service not yet initialized, attempting to initialize...'
      );
      this.initializeTransporter();
      // Esperar un poco para que se complete la inicialización
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return this.initialized;
  }

  private async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email transporter not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email connection verification failed:', error);
      return false;
    }
  }

  private formatTicketId(ticketId: string): string {
    // Mostrar solo los primeros 8 caracteres del UUID
    return ticketId.substring(0, 8).toUpperCase();
  }

  private getPriorityTranslation(priority: string): string {
    const translations: { [key: string]: string } = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente',
    };
    return translations[priority] || priority;
  }

  private getStatusTranslation(status: string): string {
    const translations: { [key: string]: string } = {
      open: 'Abierto',
      in_progress: 'En Progreso',
      resolved: 'Resuelto',
      closed: 'Cerrado',
      redirected: 'Redireccionado',
    };
    return translations[status] || status;
  }

  private generateTicketCreatedEmail(data: TicketEmailData): {
    subject: string;
    html: string;
    text: string;
  } {
    const { ticket, customer, technician } = data;
    const ticketId = this.formatTicketId(ticket.id);
    const priority = this.getPriorityTranslation(ticket.priority);
    const status = this.getStatusTranslation(ticket.status);

    const subject = `SE CREO TICKET DE SOPORTE REMOTO PARTEQUIPOS CON ID No.${ticketId}, Estado: ${status}, Prioridad: ${priority}`;

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo Ticket de Soporte</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .logo-container {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 20px;
          }
          .ticket-info {
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #bdc3c7;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #2c3e50;
          }
          .value {
            color: #34495e;
          }
          .priority-urgent { color: #e74c3c; font-weight: bold; }
          .priority-high { color: #f39c12; font-weight: bold; }
          .priority-medium { color: #f1c40f; font-weight: bold; }
          .priority-low { color: #27ae60; font-weight: bold; }
          .content {
            margin: 20px 0;
          }
          .footer {
            background-color: #34495e;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="${this.logoUrl}" alt="Partequipos S.A.S" class="logo" />
          </div>
          <div class="header">
            <h1>🎫 Nuevo Ticket de Soporte Remoto</h1>
            <p>Partequipos S.A.S</p>
          </div>
          
          <div class="ticket-info">
            <div class="info-row">
              <span class="label">ID del Ticket:</span>
              <span class="value">${ticketId}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado:</span>
              <span class="value">${status}</span>
            </div>
            <div class="info-row">
              <span class="label">Prioridad:</span>
              <span class="value priority-${ticket.priority}">${priority}</span>
            </div>
            <div class="info-row">
              <span class="label">Cliente:</span>
              <span class="value">${customer.name} (${customer.email})</span>
            </div>
            ${
              technician
                ? `
            <div class="info-row">
              <span class="label">Técnico Asignado:</span>
              <span class="value">${technician.name}</span>
            </div>
            `
                : ''
            }
            <div class="info-row">
              <span class="label">Fecha de Creación:</span>
              <span class="value">${new Date(ticket.createdAt).toLocaleString(
                'es-CO'
              )}</span>
            </div>
          </div>

          <div class="content">
            <h2>📋 Detalles del Ticket</h2>
            <h3>Título:</h3>
            <p><strong>${ticket.title}</strong></p>
            
            <h3>Descripción:</h3>
            <p>${ticket.description}</p>
          </div>

          <div class="footer">
            <p><strong>Equipo de Soporte Remoto Partequipos S.A.S</strong></p>
            <p>📧 soportemq@partequipos.com</p>
            <p>Este correo fue enviado automáticamente por el sistema de tickets.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
NUEVO TICKET DE SOPORTE REMOTO - PARTEQUIPOS S.A.S

ID del Ticket: ${ticketId}
Estado: ${status}
Prioridad: ${priority}
Cliente: ${customer.name} (${customer.email})
${technician ? `Técnico Asignado: ${technician.name}` : ''}
Fecha de Creación: ${new Date(ticket.createdAt).toLocaleString('es-CO')}

TÍTULO: ${ticket.title}

DESCRIPCIÓN:
${ticket.description}

---
Equipo de Soporte Remoto Partequipos S.A.S
Email: soportemq@partequipos.com
Este correo fue enviado automáticamente por el sistema de tickets.
    `;

    return { subject, html, text };
  }

  private generateTicketStatusChangeEmail(data: TicketStatusChangeData): {
    subject: string;
    html: string;
    text: string;
  } {
    const { ticket, customer, technician, oldStatus, newStatus } = data;
    const ticketId = this.formatTicketId(ticket.id);
    const priority = this.getPriorityTranslation(ticket.priority);
    const oldStatusTranslated = this.getStatusTranslation(oldStatus);
    const newStatusTranslated = this.getStatusTranslation(newStatus);

    const subject = `ACTUALIZACIÓN TICKET DE SOPORTE REMOTO PARTEQUIPOS ID No.${ticketId} - Estado: ${oldStatusTranslated} → ${newStatusTranslated}`;

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Actualización de Ticket de Soporte</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .logo-container {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 20px;
          }
          .status-change {
            background-color: #3498db;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: bold;
          }
          .ticket-info {
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #bdc3c7;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #2c3e50;
          }
          .value {
            color: #34495e;
          }
          .priority-urgent { color: #e74c3c; font-weight: bold; }
          .priority-high { color: #f39c12; font-weight: bold; }
          .priority-medium { color: #f1c40f; font-weight: bold; }
          .priority-low { color: #27ae60; font-weight: bold; }
          .content {
            margin: 20px 0;
          }
          .footer {
            background-color: #34495e;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="${this.logoUrl}" alt="Partequipos S.A.S" class="logo" />
          </div>
          <div class="header">
            <h1>🔄 Actualización de Ticket de Soporte</h1>
            <p>Partequipos S.A.S</p>
          </div>
          
          <div class="status-change">
            Estado: ${oldStatusTranslated} → ${newStatusTranslated}
          </div>
          
          <div class="ticket-info">
            <div class="info-row">
              <span class="label">ID del Ticket:</span>
              <span class="value">${ticketId}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado Anterior:</span>
              <span class="value">${oldStatusTranslated}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado Actual:</span>
              <span class="value">${newStatusTranslated}</span>
            </div>
            <div class="info-row">
              <span class="label">Prioridad:</span>
              <span class="value priority-${ticket.priority}">${priority}</span>
            </div>
            <div class="info-row">
              <span class="label">Cliente:</span>
              <span class="value">${customer.name} (${customer.email})</span>
            </div>
            ${
              technician
                ? `
            <div class="info-row">
              <span class="label">Técnico Asignado:</span>
              <span class="value">${technician.name}</span>
            </div>
            `
                : ''
            }
            <div class="info-row">
              <span class="label">Fecha de Actualización:</span>
              <span class="value">${new Date(ticket.updatedAt).toLocaleString(
                'es-CO'
              )}</span>
            </div>
          </div>

          <div class="content">
            <h2>📋 Detalles del Ticket</h2>
            <h3>Título:</h3>
            <p><strong>${ticket.title}</strong></p>
            
            <h3>Descripción:</h3>
            <p>${ticket.description}</p>
          </div>

          <div class="footer">
            <p><strong>Equipo de Soporte Remoto Partequipos S.A.S</strong></p>
            <p>📧 soportemq@partequipos.com</p>
            <p>Este correo fue enviado automáticamente por el sistema de tickets.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
ACTUALIZACIÓN DE TICKET DE SOPORTE REMOTO - PARTEQUIPOS S.A.S

ID del Ticket: ${ticketId}
Estado: ${oldStatusTranslated} → ${newStatusTranslated}
Prioridad: ${priority}
Cliente: ${customer.name} (${customer.email})
${technician ? `Técnico Asignado: ${technician.name}` : ''}
Fecha de Actualización: ${new Date(ticket.updatedAt).toLocaleString('es-CO')}

TÍTULO: ${ticket.title}

DESCRIPCIÓN:
${ticket.description}

---
Equipo de Soporte Remoto Partequipos S.A.S
Email: soportemq@partequipos.com
Este correo fue enviado automáticamente por el sistema de tickets.
    `;

    return { subject, html, text };
  }

  private generateTechnicianAssignmentEmail(data: TechnicianAssignmentData): {
    subject: string;
    html: string;
    text: string;
  } {
    const { ticket, customer, technician, isReassignment, previousTechnician } = data;
    const ticketId = this.formatTicketId(ticket.id);
    const priority = this.getPriorityTranslation(ticket.priority);
    const status = this.getStatusTranslation(ticket.status);
    
    const actionText = isReassignment ? 'Reasignado' : 'Asignado';

    const subject = `TICKET ${actionText.toUpperCase()} - SOPORTE REMOTO PARTEQUIPOS ID No.${ticketId}`;

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ticket ${actionText}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .logo-container {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 200px;
            height: auto;
          }
          .header {
            background-color: #27ae60;
            color: white;
            padding: 20px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 20px;
          }
          .assignment-notice {
            background-color: #3498db;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: bold;
          }
          .ticket-info {
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #bdc3c7;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: bold;
            color: #2c3e50;
          }
          .value {
            color: #34495e;
          }
          .priority-urgent { color: #e74c3c; font-weight: bold; }
          .priority-high { color: #f39c12; font-weight: bold; }
          .priority-medium { color: #f1c40f; font-weight: bold; }
          .priority-low { color: #27ae60; font-weight: bold; }
          .content {
            margin: 20px 0;
          }
          .technician-highlight {
            background-color: #27ae60;
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            text-align: center;
          }
          .footer {
            background-color: #34495e;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo-container">
            <img src="${this.logoUrl}" alt="Partequipos S.A.S" class="logo" />
          </div>
          <div class="header">
            <h1>👨‍🔧 Ticket ${actionText}</h1>
            <p>Partequipos S.A.S</p>
          </div>
          
          <div class="assignment-notice">
            ${isReassignment ? '🔄 Ticket Reasignado' : '✅ Nuevo Ticket Asignado'}
          </div>

          <div class="technician-highlight">
            <h2 style="margin: 0;">Técnico ${actionText}: ${technician.name}</h2>
            <p style="margin: 5px 0 0 0;">${technician.email}</p>
            ${isReassignment && previousTechnician ? `
            <p style="margin: 10px 0 0 0; font-size: 14px;">Anteriormente: ${previousTechnician.name}</p>
            ` : ''}
          </div>
          
          <div class="ticket-info">
            <div class="info-row">
              <span class="label">ID del Ticket:</span>
              <span class="value">${ticketId}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado:</span>
              <span class="value">${status}</span>
            </div>
            <div class="info-row">
              <span class="label">Prioridad:</span>
              <span class="value priority-${ticket.priority}">${priority}</span>
            </div>
            <div class="info-row">
              <span class="label">Cliente:</span>
              <span class="value">${customer.name} (${customer.email})</span>
            </div>
            <div class="info-row">
              <span class="label">Fecha de Creación:</span>
              <span class="value">${new Date(ticket.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</span>
            </div>
          </div>

          <div class="content">
            <h2>📋 Detalles del Ticket</h2>
            <h3>Título:</h3>
            <p><strong>${ticket.title}</strong></p>
            
            <h3>Descripción:</h3>
            <p>${ticket.description}</p>
          </div>

          <div class="footer">
            <p><strong>Equipo de Soporte Remoto Partequipos S.A.S</strong></p>
            <p>📧 soportemq@partequipos.com</p>
            <p>Este correo fue enviado automáticamente por el sistema de tickets.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
TICKET ${actionText.toUpperCase()} - SOPORTE REMOTO PARTEQUIPOS S.A.S

${isReassignment ? 'REASIGNACIÓN DE TICKET' : 'NUEVO TICKET ASIGNADO'}

Técnico ${actionText}: ${technician.name} (${technician.email})
${isReassignment && previousTechnician ? `Anteriormente: ${previousTechnician.name}` : ''}

ID del Ticket: ${ticketId}
Estado: ${status}
Prioridad: ${priority}
Cliente: ${customer.name} (${customer.email})
Fecha de Creación: ${new Date(ticket.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}

TÍTULO: ${ticket.title}

DESCRIPCIÓN:
${ticket.description}

---
Equipo de Soporte Remoto Partequipos S.A.S
Email: soportemq@partequipos.com
Este correo fue enviado automáticamente por el sistema de tickets.
    `;

    return { subject, html, text };
  }

  async sendTicketCreatedNotification(data: TicketEmailData): Promise<boolean> {
    const isInitialized = await this.ensureInitialized();
    if (!isInitialized || !this.transporter) {
      logger.warn('Email service not available - transporter not initialized');
      return false;
    }

    const isConnected = await this.verifyConnection();
    if (!isConnected) {
      logger.error('Email service connection failed');
      return false;
    }

    try {
      const { subject, html, text } = this.generateTicketCreatedEmail(data);

      // Enviar solo un correo al cliente con copia al equipo de soporte
      const mailOptions = {
        from: `"Soporte Remoto Partequipos" <${process.env.SMTP_USER}>`,
        to: data.customer.email,
        cc: [this.supportEmail, this.additionalSupportEmail, this.managementEmail].join(', '), // Copia al equipo de soporte y gerencia
        subject,
        html,
        text,
      };

      await this.transporter.sendMail(mailOptions);

      logger.info(
        `Ticket creation email sent successfully for ticket ${this.formatTicketId(
          data.ticket.id
        )}`
      );
      return true;
    } catch (error) {
      logger.error('Failed to send ticket creation email:', error);
      return false;
    }
  }

  async sendTicketStatusChangeNotification(
    data: TicketStatusChangeData
  ): Promise<boolean> {
    const isInitialized = await this.ensureInitialized();
    if (!isInitialized || !this.transporter) {
      logger.warn('Email service not available - transporter not initialized');
      return false;
    }

    const isConnected = await this.verifyConnection();
    if (!isConnected) {
      logger.error('Email service connection failed');
      return false;
    }

    try {
      const { subject, html, text } =
        this.generateTicketStatusChangeEmail(data);

      // Enviar correo al cliente con copia al equipo de soporte
      const mailOptions = {
        from: `"Soporte Remoto Partequipos" <${process.env.SMTP_USER}>`,
        to: data.customer.email,
        cc: [this.supportEmail, this.additionalSupportEmail].join(', '), // Copia al equipo de soporte
        subject,
        html,
        text,
      };

      await this.transporter.sendMail(mailOptions);

      logger.info(
        `Ticket status change email sent successfully for ticket ${this.formatTicketId(
          data.ticket.id
        )} - ${data.oldStatus} → ${data.newStatus}`
      );
      return true;
    } catch (error) {
      logger.error('Failed to send ticket status change email:', error);
      return false;
    }
  }

  async sendTechnicianAssignmentNotification(data: TechnicianAssignmentData): Promise<boolean> {
    const isInitialized = await this.ensureInitialized();
    if (!isInitialized || !this.transporter) {
      logger.warn('Email service not available - transporter not initialized');
      return false;
    }

    const isConnected = await this.verifyConnection();
    if (!isConnected) {
      logger.error('Email service connection failed');
      return false;
    }

    try {
      const { subject, html, text } = this.generateTechnicianAssignmentEmail(data);

      // Enviar correo al técnico con copia al cliente, gerencia y coordinación
      const mailOptions = {
        from: `"Soporte Remoto Partequipos" <${process.env.SMTP_USER}>`,
        to: data.technician.email,
        cc: [data.customer.email, this.managementEmail, this.additionalSupportEmail].join(', '), // Copia a cliente, gerencia y coordinación
        subject,
        html,
        text,
      };

      await this.transporter.sendMail(mailOptions);

      const actionText = data.isReassignment ? 'reasignación' : 'asignación';
      logger.info(
        `Technician ${actionText} email sent successfully for ticket ${this.formatTicketId(
          data.ticket.id
        )} to ${data.technician.email} with CC to ${data.customer.email}`
      );
      return true;
    } catch (error) {
      logger.error('Failed to send technician assignment email:', error);
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<boolean> {
    const isInitialized = await this.ensureInitialized();
    if (!isInitialized || !this.transporter) {
      logger.warn('Email service not available - transporter not initialized');
      return false;
    }

    const isConnected = await this.verifyConnection();
    if (!isConnected) {
      logger.error('Email service connection failed');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Soporte Remoto Partequipos" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Prueba de Configuración de Email - Partequipos',
        html: `
          <h2>✅ Configuración de Email Exitosa</h2>
          <p>El servicio de correo electrónico está funcionando correctamente.</p>
          <p><strong>Partequipos S.A.S - Sistema de Soporte Remoto</strong></p>
        `,
        text: 'Configuración de Email Exitosa - Partequipos S.A.S - Sistema de Soporte Remoto',
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Test email sent successfully to ${to}`);
      return true;
    } catch (error) {
      logger.error('Failed to send test email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
