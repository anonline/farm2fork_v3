import { del } from '@vercel/blob';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// app/api/delete/route.ts

import { CONFIG } from 'src/global-config';
import { supabaseSSR } from 'src/lib/supabase-ssr';

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

    const { url } = await request.json();

    if (!url) {
        return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    try {
        await del(url, { token: CONFIG.blob.readWriteToken });

        return NextResponse.json({ success: true, message: 'Image deleted.' });
    } catch (error) {
        console.error('Error deleting blob:', error);
        return NextResponse.json({ error: 'Failed to delete image.' }, { status: 500 });
    }
}
