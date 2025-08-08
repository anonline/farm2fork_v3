import type { UploadFolder} from 'src/lib/blob/blobService';

// app/api/upload/route.ts
import { NextResponse } from 'next/server';

import { uploadImageAndSaveToDB } from 'src/lib/blob/blobService';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder') as UploadFolder;
  const filename = searchParams.get('filename');

  if (!folder || !filename) {
    return NextResponse.json({ message: 'Hiányzó paraméterek.' }, { status: 400 });
  }

  try {
    const blob = await uploadImageAndSaveToDB(
      folder,
      filename,
      request.body as ReadableStream,
    );
    return NextResponse.json(blob);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Feltöltési hiba.' }, { status: 500 });
  }
}
