// lib/blobClient.ts
export type UploadFolder = 'categories' | 'products' | 'assets' | 'producers' | 'aboutus';

// lib/blobClient.ts
export async function uploadFile(file: File, folder: UploadFolder, entityId: number) {
    const res = await fetch(
        `/api/img/upload?folder=${folder}&filename=${encodeURIComponent(file.name)}&entityId=${entityId}`,
        { method: 'POST', body: file }
    );

    if (!res.ok) throw new Error('Feltöltési hiba');
    return res.json();
}

export async function deleteFile(url: string) {
    const res = await fetch(`/api/img/delete`, {
        method: 'DELETE',
        body: JSON.stringify({
            url,
        })
    });

    if (!res.ok) throw new Error('Törlési hiba');
}
