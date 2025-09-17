import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Mail, Download, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reportService } from '../services/reportService';

interface Report {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  attachments: string[];
}

const ReportsPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ reportId: string; reportTitle: string } | null>(null);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    attachments: [] as File[],
  });
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: reportService.getReports,
  });

  const createReportMutation = useMutation({
    mutationFn: async () => {
      return reportService.createReport({
        title: newReport.title,
        description: newReport.description,
        attachments: newReport.attachments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Informe creado exitosamente');
      setIsCreating(false);
      setNewReport({
        title: '',
        description: '',
        attachments: [],
      });
    },
    onError: (error) => {
      console.error('Error al crear el informe:', error);
      toast.error('Error al crear el informe');
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      return reportService.deleteReport(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Informe eliminado exitosamente');
      setDeleteConfirm(null);
    },
    onError: (error) => {
      console.error('Error al eliminar el informe:', error);
      toast.error('Error al eliminar el informe');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewReport(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Enviando informe:', newReport);
      createReportMutation.mutate();
    } catch (error) {
      console.error('Error al crear el informe:', error);
    }
  };

  const handleDownloadPDF = async (reportId: string) => {
    try {
      const report = reports?.find(r => r.id === reportId);
      if (!report) return;

      const pdfBlob = await reportService.generatePDF(report);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Informe descargado exitosamente');
    } catch (error) {
      toast.error('Error al descargar el informe');
    }
  };

  const handleSendEmail = async (reportId: string) => {
    try {
      const report = reports?.find(r => r.id === reportId);
      if (!report) return;

      const email = prompt('Ingrese el correo electrónico del destinatario:');
      if (!email) return;

      await reportService.sendEmail(report, email);
      toast.success('Informe enviado exitosamente');
    } catch (error) {
      toast.error('Error al enviar el informe');
    }
  };

  const handleDownloadAttachment = async (report: Report, fileName: string) => {
    try {
      const blob = await reportService.downloadAttachment(report, fileName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      toast.error('Error al descargar el archivo adjunto');
    }
  };

  const handleDeleteClick = (reportId: string, reportTitle: string) => {
    setDeleteConfirm({ reportId, reportTitle });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteReportMutation.mutate(deleteConfirm.reportId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Informes de Soporte</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nuevo Informe
        </button>
      </div>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Informe</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-lg h-32"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Adjuntos</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-lg"
                />
                {newReport.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      {newReport.attachments.length} archivo(s) seleccionado(s)
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={createReportMutation.isPending}
                >
                  {createReportMutation.isPending ? 'Creando...' : 'Crear Informe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <p>Cargando informes...</p>
        ) : !reports || reports.length === 0 ? (
          <p className="text-gray-500">No hay informes creados</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-gray-600 mt-1">{report.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Creado el {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadPDF(report.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Descargar PDF"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => handleSendEmail(report.id)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Enviar por correo"
                  >
                    <Mail size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(report.id, report.title)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    title="Eliminar informe"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              {report.attachments && report.attachments.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-semibold mb-2">Archivos adjuntos:</h4>
                  <ul className="list-disc list-inside">
                    {report.attachments?.map((attachment) => (
                      <li key={attachment} className="flex items-center gap-2">
                        <span>{attachment}</span>
                        <button
                          onClick={() => handleDownloadAttachment(report, attachment)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Descargar
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar el informe "{deleteConfirm.reportTitle}"? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                disabled={deleteReportMutation.isPending}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={deleteReportMutation.isPending}
              >
                {deleteReportMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage; 