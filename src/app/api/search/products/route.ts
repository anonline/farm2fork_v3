import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // vagy anon key, ha nincs jogosultságigény
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '3'), 50);

    if (!q || q.trim() === '') {
        return NextResponse.json({ error: 'Hiányzik a keresési kifejezés' }, { status: 400 });
    }

    const searchTerm = `%${q}%`;

    const { data: matchingProducers } = await supabase
        .from('Producers')
        .select('id')
        .or(
            `name.ilike.%${q}%,location.ilike.%${q}%,shortDescription.ilike.%${q}%,producingTags.ilike.%${q}%,companyName.ilike.%${q}%`
        );

    const producerIds = matchingProducers?.map((p) => p.id) ?? [];

    const { data, error } = await supabase
        .from('Products')
        .select('*')
        .eq('publish', true)
        .or(
            `name.ilike.${searchTerm}${producerIds.length ? `,producerId.in.(${producerIds.join(',')})` : ''}`
        )
        .limit(limit);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
