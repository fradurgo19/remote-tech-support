import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportData {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  attachments: string[];
}

const API_URL = '/api/reports';

export const reportService = {
  async createReport(data: { title: string; description: string; attachments: File[] }): Promise<ReportData> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    data.attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al crear el informe');
    }

    return response.json();
  },

  async getReports(): Promise<ReportData[]> {
    const response = await fetch(API_URL, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al obtener los informes');
    }

    return response.json();
  },

  async generatePDF(report: ReportData): Promise<Blob> {
    const response = await fetch(`${API_URL}/${report.id}/pdf`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al generar el PDF');
    }

    return response.blob();
  },

  async sendEmail(report: ReportData, email: string): Promise<void> {
    const response = await fetch(`${API_URL}/${report.id}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }
  },
}; 