// lib/blobService.ts
import type { PutBlobResult } from '@vercel/blob';

import { put } from '@vercel/blob';
import * as crypto from 'node:crypto';

import { CONFIG } from 'src/global-config';

export type UploadFolder = 'category' | 'product' | 'assets' | 'news' | 'articles';

function generateUniqueFilename(originalName: string) {
    const ext = originalName.split('.').pop();
    const uniqueId = crypto.randomBytes(8).toString('hex');
    return `${Date.now()}-${uniqueId}.${ext}`;
}

export async function uploadImageAndSaveToDB(
    folder: UploadFolder,
    originalFilename: string,
    stream: ReadableStream
): Promise<PutBlobResult | null> {
    const uniqueName = generateUniqueFilename(originalFilename);
    const path = `${folder}/${uniqueName}`;

    const blob = await put(path, stream, { access: 'public', token: CONFIG.blob.readWriteToken });

    return blob;
}

// Ezt a függvényt hívod meg a kliensoldalon (pl. egy gombnyomásra)

export async function deleteImageAndCleanDB(url: string) {
    try {
        const response = await fetch('/api/img/delete/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete image.');
        }

        console.log('Image deleted successfully via server.');
    } catch (error) {
        console.error('Client-side error:', error);
    }
}
