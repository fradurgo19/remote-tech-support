import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportData {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  attachments: string[];
}

const API_URL = 'http://localhost:3000/api/reports';

// Función helper para obtener el token de autenticación
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Función helper para hacer llamadas HTTP
const apiCall = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en la API');
  }

  return response.json();
};

export const reportService = {
  async createReport(data: { title: string; description: string; attachments: File[] }): Promise<ReportData> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('type', 'technical');
    formData.append('status', 'draft');
    formData.append('priority', 'medium');
    
    // Agregar archivos adjuntos
    data.attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    const token = getAuthToken();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en la API');
    }

    const result = await response.json();
    return result.report;
  },

  async getReports(): Promise<ReportData[]> {
    const response = await apiCall(API_URL);
    return response;
  },

  async generatePDF(report: ReportData): Promise<Blob> {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/${report.id}/pdf`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Error al generar el PDF');
    }

    return response.blob();
  },

  async downloadAttachment(report: ReportData, fileName: string): Promise<Blob> {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/${report.id}/attachments/${fileName}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Error al descargar el archivo adjunto');
    }

    return response.blob();
  },

  async sendEmail(report: ReportData, email: string): Promise<void> {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/${report.id}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Error al enviar el correo');
    }
  },

  async deleteReport(reportId: string): Promise<void> {
    const response = await apiCall(`${API_URL}/${reportId}`, {
      method: 'DELETE',
    });
    return response;
  },
}; 