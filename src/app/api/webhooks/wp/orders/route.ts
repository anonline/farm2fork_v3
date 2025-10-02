import type { NextRequest } from 'next/server';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { supabaseSSR } from 'src/lib/supabase-ssr';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);

    return NextResponse.json({ error: 'Invalid JSON' }, { status: 403 });
}
