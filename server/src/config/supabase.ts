/**
 * Supabase Configuration
 * Configuración de Supabase para Storage y autenticación
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required Supabase environment variables:', missingEnvVars.join(', '));
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  } else {
    console.warn('⚠️  Running in development mode without Supabase configuration');
  }
}

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente de Supabase con service_role para operaciones del servidor
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Nombres de los buckets
export const STORAGE_BUCKETS = {
  AVATARS: process.env.SUPABASE_BUCKET_AVATARS || 'avatars',
  MESSAGES: process.env.SUPABASE_BUCKET_MESSAGES || 'message-attachments',
  REPORTS: process.env.SUPABASE_BUCKET_REPORTS || 'report-attachments'
};

/**
 * Helper para subir archivos a Supabase Storage
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<{ url: string; path: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error uploading file to Supabase Storage:', error);
    throw error;
  }
};

/**
 * Helper para eliminar archivos de Supabase Storage
 */
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file from Supabase Storage:', error);
    throw error;
  }
};

/**
 * Helper para obtener URL pública de un archivo
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

/**
 * Helper para crear URL firmada temporal (para archivos privados)
 */
export const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
};

/**
 * Inicializar buckets de Storage
 * Esta función crea los buckets si no existen (ejecutar una vez)
 */
export const initializeStorageBuckets = async (): Promise<void> => {
  try {
    const buckets = Object.values(STORAGE_BUCKETS);

    for (const bucketName of buckets) {
      // Verificar si el bucket existe
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some(b => b.name === bucketName);

      if (!bucketExists) {
        // Crear bucket público
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
          ]
        });

        if (error) {
          console.error(`Error creating bucket ${bucketName}:`, error);
        } else {
          console.log(`✅ Bucket ${bucketName} created successfully`);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
};

export default supabase;

