/**
 * Storage Service
 * Servicio para manejo de archivos usando Supabase Storage
 */

import {
  STORAGE_BUCKETS,
  uploadFile,
  deleteFile,
  getPublicUrl
} from '../config/supabase';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interfaz para resultado de upload
 */
export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Clase StorageService para manejo de archivos
 */
class StorageService {
  /**
   * Subir avatar de usuario
   */
  async uploadAvatar(
    userId: string,
    file: Express.Multer.File
  ): Promise<UploadResult> {
    try {
      const fileExtension = path.extname(file.originalname);
      const filename = `${userId}-${Date.now()}${fileExtension}`;
      const filePath = `${userId}/${filename}`;

      const { url, path: storagePath } = await uploadFile(
        STORAGE_BUCKETS.AVATARS,
        filePath,
        file.buffer,
        file.mimetype
      );

      return {
        url,
        path: storagePath,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  /**
   * Subir archivo adjunto de mensaje
   */
  async uploadMessageAttachment(
    ticketId: string,
    messageId: string,
    file: Express.Multer.File
  ): Promise<UploadResult> {
    try {
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      const filePath = `${ticketId}/${messageId}/${filename}`;

      const { url, path: storagePath } = await uploadFile(
        STORAGE_BUCKETS.MESSAGES,
        filePath,
        file.buffer,
        file.mimetype
      );

      return {
        url,
        path: storagePath,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      };
    } catch (error) {
      console.error('Error uploading message attachment:', error);
      throw new Error('Failed to upload message attachment');
    }
  }

  /**
   * Subir archivo adjunto de reporte
   */
  async uploadReportAttachment(
    reportId: string,
    file: Express.Multer.File
  ): Promise<UploadResult> {
    try {
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      const filePath = `${reportId}/${filename}`;

      const { url, path: storagePath } = await uploadFile(
        STORAGE_BUCKETS.REPORTS,
        filePath,
        file.buffer,
        file.mimetype
      );

      return {
        url,
        path: storagePath,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      };
    } catch (error) {
      console.error('Error uploading report attachment:', error);
      throw new Error('Failed to upload report attachment');
    }
  }

  /**
   * Eliminar avatar de usuario
   */
  async deleteAvatar(avatarPath: string): Promise<void> {
    try {
      await deleteFile(STORAGE_BUCKETS.AVATARS, avatarPath);
    } catch (error) {
      console.error('Error deleting avatar:', error);
      // No lanzar error, solo logear
    }
  }

  /**
   * Eliminar archivo adjunto de mensaje
   */
  async deleteMessageAttachment(attachmentPath: string): Promise<void> {
    try {
      await deleteFile(STORAGE_BUCKETS.MESSAGES, attachmentPath);
    } catch (error) {
      console.error('Error deleting message attachment:', error);
      // No lanzar error, solo logear
    }
  }

  /**
   * Eliminar archivo adjunto de reporte
   */
  async deleteReportAttachment(attachmentPath: string): Promise<void> {
    try {
      await deleteFile(STORAGE_BUCKETS.REPORTS, attachmentPath);
    } catch (error) {
      console.error('Error deleting report attachment:', error);
      // No lanzar error, solo logear
    }
  }

  /**
   * Obtener URL pública de un archivo
   */
  getPublicUrl(bucket: string, path: string): string {
    return getPublicUrl(bucket, path);
  }

  /**
   * Validar tipo de archivo
   */
  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.mimetype.startsWith(category + '/');
      }
      return file.mimetype === type;
    });
  }

  /**
   * Validar tamaño de archivo
   */
  validateFileSize(file: Express.Multer.File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
}

// Exportar instancia única
export const storageService = new StorageService();

export default storageService;

