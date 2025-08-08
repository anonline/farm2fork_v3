// lib/blobClient.ts
export type UploadFolder = 'categories' | 'products' | 'assets';

// lib/blobClient.ts
export async function uploadFile(file: File, folder: UploadFolder, entityId: number) {
  const res = await fetch(
    `/api/upload?folder=${folder}&filename=${encodeURIComponent(file.name)}&entityId=${entityId}`,
    { method: 'POST', body: file }
  );

  if (!res.ok) throw new Error('Feltöltési hiba');
  return res.json();
}

export async function deleteFile(url: string, folder: UploadFolder) {
  const res = await fetch(
    `/api/delete?url=${encodeURIComponent(url)}&folder=${folder}`,
    { method: 'DELETE' }
  );

  if (!res.ok) throw new Error('Törlési hiba');
}
