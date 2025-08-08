// lib/blobService.ts
import type { PutBlobResult } from '@vercel/blob';

import crypto from 'crypto';
import { put, del } from '@vercel/blob';

import { CONFIG } from 'src/global-config';

export type UploadFolder = 'category' | 'product' | 'assets' | 'news';


function generateUniqueFilename(originalName: string) {
  const ext = originalName.split('.').pop();
  const uniqueId = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${uniqueId}.${ext}`;
}

export async function uploadImageAndSaveToDB(
  folder: UploadFolder,
  originalFilename: string,
  stream: ReadableStream,
): Promise<PutBlobResult | null> {
  const uniqueName = generateUniqueFilename(originalFilename);
  const path = `${folder}/${uniqueName}`;

  const blob = await put(path, stream, { access: 'public', token: CONFIG.blob.readWriteToken });

  return blob;
}

export async function deleteImageAndCleanDB(url: string) {
  await del(url, {token: CONFIG.blob.readWriteToken});
}
