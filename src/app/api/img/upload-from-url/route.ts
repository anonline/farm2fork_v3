import type { UploadFolder } from 'src/lib/blob/blobService';

import { cookies } from 'next/headers';
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

    try {
        const body = await request.json();
        const { imageUrl, folder, filename } = body;

        if (!imageUrl || !folder || !filename) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Fetch the image from the external URL (server-side, no CORS issues)
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Farm2Fork-Sync/1.0',
            },
        });

        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }

        // Get the image as a ReadableStream
        const imageStream = imageResponse.body;
        if (!imageStream) {
            throw new Error('Failed to get image stream');
        }

        // Upload to Vercel Blob
        const blob = await uploadImageAndSaveToDB(
            folder as UploadFolder,
            filename,
            imageStream
        );

        return NextResponse.json({
            success: true,
            url: blob?.url,
            filename: blob?.pathname,
        });

    } catch (error) {
        console.error('Error uploading image from URL:', error);
        return NextResponse.json(
            { error: `Upload failed: ${error}` },
            { status: 500 }
        );
    }
}
