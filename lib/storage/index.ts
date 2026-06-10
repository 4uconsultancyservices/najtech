import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

async function uploadLocal(file: File, folder = 'uploads'): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), 'public', folder);
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  return {
    url: `/${folder}/${filename}`,
    filename,
    size: file.size,
    mimeType: file.type,
  };
}

async function uploadCloudinary(file: File, folder = 'internvault'): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64}`;

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: dataURI,
        folder,
        api_key: process.env.CLOUDINARY_API_KEY,
        timestamp: Math.floor(Date.now() / 1000),
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Upload failed');

  return {
    url: data.secure_url,
    filename: data.public_id,
    size: data.bytes,
    mimeType: file.type,
  };
}

export async function uploadFile(file: File, folder?: string): Promise<UploadResult> {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  if (provider === 'cloudinary') {
    return uploadCloudinary(file, folder);
  }

  return uploadLocal(file, folder);
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(
    (type) =>
      file.type === type ||
      file.name.toLowerCase().endsWith(`.${type.split('/')[1]}`)
  );
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export const MAX_FILE_SIZE = {
  image: 5 * 1024 * 1024,       // 5MB
  document: 50 * 1024 * 1024,   // 50MB
  video: 500 * 1024 * 1024,     // 500MB
};
