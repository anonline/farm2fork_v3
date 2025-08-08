// app/api/delete/route.ts
import { NextResponse } from 'next/server';

import { deleteImageAndCleanDB } from 'src/lib/blob/blobService';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const folder = searchParams.get('folder') as any;

  if (!url || !folder) {
    return NextResponse.json({ message: 'Hiányzó paraméterek.' }, { status: 400 });
  }

  try {
    await deleteImageAndCleanDB(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Törlési hiba.' }, { status: 500 });
  }
}
