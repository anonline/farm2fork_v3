import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';



const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' // vagy anon key, ha nincs jogosultságigény
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
    .or(`tags.ilike.%${q}%,name.ilike.${searchTerm}`);

    const matchingProducerIds = matchingProducts?.map((p) => p.producerId) ?? [];

    const searchConditions = [
        `name.ilike.${searchTerm}`,
        `location.ilike.${searchTerm}`,
        `shortDescription.ilike.${searchTerm}`,
        `producingTags.ilike.${searchTerm}`,
        `companyName.ilike.${searchTerm}`
    ];

    if (matchingProducerIds.length > 0) {
        const producerIdsCondition = `id.in.(${matchingProducerIds.join(',')})`;
        searchConditions.push(producerIdsCondition);
    }

    const { data, error } = await supabase
        .from('Producers')
        .select('*')
        .or(searchConditions.join(','));

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
