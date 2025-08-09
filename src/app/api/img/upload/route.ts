import type { UploadFolder } from 'src/lib/blob/blobService';

import { cookies } from 'next/headers';
// app/api/upload/route.ts
import { NextResponse } from 'next/server';

import { supabaseSSR } from 'src/lib/supabase-ssr';
import { uploadImageAndSaveToDB } from 'src/lib/blob/blobService';

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = await supabase.from('roles').select('*').eq('uid', user.id).single();
    if (role.error || role.data.is_admin !== true) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') as UploadFolder;
    const filename = searchParams.get('filename');

    if (!folder || !filename) {
        return NextResponse.json({ message: 'Hiányzó paraméterek.' }, { status: 400 });
    }

    try {
        const blob = await uploadImageAndSaveToDB(folder, filename, request.body as ReadableStream);
        return NextResponse.json(blob);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Feltöltési hiba.' }, { status: 500 });
    }
}
