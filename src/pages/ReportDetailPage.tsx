import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Loader2,
  Tag,
  User,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card';
import { Spinner } from '../atoms/Spinner';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/api';

interface ReportDetailPageProps {}

const ReportDetailPage: React.FC<ReportDetailPageProps> = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = React.useCallback(async () => {
    if (!reportId) return;

    try {
      setIsLoading(true);
      setError(null);
      const reportData = await reportService.getReportById(reportId);
      setReport(reportData);
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Error al cargar el informe');
      toast.error('Error al cargar el informe');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId, fetchReport]);

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className='text-yellow-500' />;
      case 'in_progress':
        return <Loader2 size={16} className='text-blue-500' />;
      case 'completed':
        return <CheckCircle size={16} className='text-green-500' />;
      case 'cancelled':
        return <XCircle size={16} className='text-red-500' />;
      default:
        return <AlertCircle size={16} className='text-gray-500' />;
    }
  };

  const getStatusVariant = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority: Report['priority']) => {
    switch (priority) {
      case 'low':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityTranslation = (priority: Report['priority']) => {
    const translations: { [key: string]: string } = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente',
    };
    return translations[priority] || priority;
  };

  const getStatusTranslation = (status: Report['status']) => {
    const translations: { [key: string]: string } = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return translations[status] || status;
  };

  const getTypeTranslation = (type: Report['type']) => {
    const translations: { [key: string]: string } = {
      technical: 'Técnico',
      maintenance: 'Mantenimiento',
      incident: 'Incidente',
      preventive: 'Preventivo',
    };
    return translations[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileExtension = (attachment: string): string => {
    if (attachment.startsWith('data:')) {
      const mimeMatch = attachment.match(/data:([^;]+)/);
      if (mimeMatch) {
        const [, mimeType] = mimeMatch;
        if (mimeType.includes('pdf')) return '.pdf';
        if (mimeType.includes('image/jpeg')) return '.jpg';
        if (mimeType.includes('image/png')) return '.png';
        if (mimeType.includes('image/gif')) return '.gif';
        if (mimeType.includes('text/plain')) return '.txt';
        if (mimeType.includes('application/msword')) return '.doc';
        if (
          mimeType.includes(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          )
        )
          return '.docx';
        if (mimeType.includes('application/vnd.ms-excel')) return '.xls';
        if (
          mimeType.includes(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          )
        )
          return '.xlsx';
        if (mimeType.includes('application/zip')) return '.zip';
        if (mimeType.includes('application/x-rar-compressed')) return '.rar';
      }
    }
    return '.pdf'; // Default extension
  };

  const extractFileName = (attachment: string, index: number): string => {
    if (attachment.startsWith('data:')) {
      const mimeMatch = attachment.match(/data:([^;]+)/);
      if (mimeMatch) {
        const extension = getFileExtension(attachment);
        return `archivo-${index + 1}${extension}`;
      }
    }
    return `archivo-${index + 1}.pdf`;
  };

  const handleDownloadAttachment = (attachment: string, index: number) => {
    try {
      const filename = extractFileName(attachment, index);
      let downloadUrl = attachment;

      // Si es una URL base64, crear un blob y descargar
      if (attachment.startsWith('data:')) {
        downloadUrl = attachment;
      } else if (attachment.startsWith('http')) {
        // Si es una URL normal, abrir en nueva pestaña
        window.open(attachment, '_blank');
        return;
      } else {
        // Si es contenido base64 sin prefijo data:, agregarlo
        downloadUrl = `data:application/octet-stream;base64,${attachment}`;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Archivo ${filename} descargado exitosamente`);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <AlertCircle size={48} className='text-red-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>
              Error al cargar el informe
            </h2>
            <p className='text-muted-foreground mb-4'>
              {error || 'El informe no fue encontrado'}
            </p>
            <Button onClick={() => navigate('/reports')}>
              <ArrowLeft size={16} className='mr-2' />
              Volver a Informes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => navigate('/reports')}
          >
            <ArrowLeft size={16} className='mr-2' />
            Volver
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>{report.title}</h1>
            <p className='text-muted-foreground'>
              Informe #{report.id.substring(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Badge variant={getStatusVariant(report.status)}>
            {getStatusIcon(report.status)}
            <span className='ml-1'>{getStatusTranslation(report.status)}</span>
          </Badge>
          <Badge variant={getPriorityVariant(report.priority)}>
            {getPriorityTranslation(report.priority)}
          </Badge>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Contenido principal */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Descripción */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText size={20} />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='prose max-w-none'>
                <p className='whitespace-pre-wrap'>{report.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Archivos adjuntos */}
          {report.attachments && report.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Download size={20} />
                  Archivos Adjuntos ({report.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {report.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors'
                    >
                      <div className='flex items-center gap-2'>
                        <FileText size={16} className='text-muted-foreground' />
                        <span className='font-medium'>Archivo {index + 1}</span>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          handleDownloadAttachment(attachment, index)
                        }
                      >
                        <Download size={14} className='mr-1' />
                        Descargar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar con información */}
        <div className='space-y-6'>
          {/* Información del informe */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Informe</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-muted-foreground'>
                  Tipo:
                </span>
                <Badge variant='outline'>
                  {getTypeTranslation(report.type)}
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-muted-foreground'>
                  Estado:
                </span>
                <Badge variant={getStatusVariant(report.status)}>
                  {getStatusIcon(report.status)}
                  <span className='ml-1'>
                    {getStatusTranslation(report.status)}
                  </span>
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-muted-foreground'>
                  Prioridad:
                </span>
                <Badge variant={getPriorityVariant(report.priority)}>
                  {getPriorityTranslation(report.priority)}
                </Badge>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-muted-foreground'>
                  Creado:
                </span>
                <span className='text-sm'>{formatDate(report.createdAt)}</span>
              </div>

              {report.updatedAt !== report.createdAt && (
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-muted-foreground'>
                    Actualizado:
                  </span>
                  <span className='text-sm'>
                    {formatDate(report.updatedAt)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información del cliente */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User size={20} />
                Cliente Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.customer ? (
                <div className='space-y-2'>
                  <div className='font-medium'>{report.customer.name}</div>
                  <div className='text-sm text-muted-foreground'>
                    {report.customer.email}
                  </div>
                </div>
              ) : (
                <div className='text-sm text-muted-foreground'>
                  No hay cliente asignado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {report.tags && report.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Tag size={20} />
                  Etiquetas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {report.tags.map((tag, index) => (
                    <Badge key={index} variant='outline'>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
