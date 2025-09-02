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

    if (!q) {
        return NextResponse.json({ error: 'Hiányzik a keresési kifejezés' }, { status: 400 });
    }

    const searchTerm = `%${q}%`;

    const { data: matchingProducts } = await supabase
        .from('Products')
        .select('producerId')
        .eq('publish', true)
        .ilike('name', searchTerm);

    const matchingProducerIds = matchingProducts?.map((p) => p.producerId) ?? [];

    const { data, error } = await supabase
        .from('Producers')
        .select('*')
        .or(
            `name.ilike.${searchTerm},location.ilike.${searchTerm},shortDescription.ilike.${searchTerm},producingTags.ilike.${searchTerm},companyName.ilike.${searchTerm}${matchingProducerIds.length ? `,id.in.(${matchingProducerIds.join(',')})` : ''}`
        );

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
