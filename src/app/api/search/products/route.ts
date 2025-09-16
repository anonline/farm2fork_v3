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
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '3'), 50);

    if (!q || q.trim() === '') {
        return NextResponse.json({ error: 'Hiányzik a keresési kifejezés' }, { status: 400 });
    }

    const searchTerm = `%${q}%`;

    const baseQuery = `tags.ilike.${searchTerm},name.ilike.${searchTerm}`;

    const productsResponse = await supabase
        .from('Products')
        .select('*')
        .eq('publish', true)
        .or(baseQuery);

    if (productsResponse.error) {
        return NextResponse.json(
            { error: 'Products: ' + productsResponse.error.message },
            { status: 500 }
        );
    }

    const { data: matchingProducers, error: producerError } = await supabase
        .from('Producers')
        .select('id')
        .eq('enabled', true)
        .or(
            `name.ilike.%${q}%,location.ilike.%${q}%,shortDescription.ilike.%${q}%,producingTags.ilike.%${q}%,companyName.ilike.%${q}%`
        );

    if (producerError) {
        return NextResponse.json({ error: 'Producers: ' + producerError.message }, { status: 500 });
    }

    let producersProducts = [];

    if (matchingProducers && matchingProducers.length > 0) {
        const producerIds = matchingProducers?.map((p) => p.id) ?? [];
        const producerQuery = producerIds.length ? `producerId.in.(${producerIds.join(',')})` : '';
        const producersProductsResponse = await supabase
            .from('Products')
            .select('*')
            .eq('publish', true)
            .or(producerQuery)
            .order('name', { ascending: true })
            .limit(limit);

        if (producersProductsResponse.error) {
            return NextResponse.json(
                { error: "Producer's Products: " + producersProductsResponse.error.message },
                { status: 500 }
            );
        }

        producersProducts = producersProductsResponse.data ?? [];
    }

    const combinedData = [
        ...(productsResponse.data.map((p) => ({ ...p, isFromProducer: false })) ?? []),
        ...(producersProducts.map((p) => ({ ...p, isFromProducer: true })) ?? []),
    ];

    const uniqueData = combinedData.filter(
        (item, index, array) => array.findIndex((t) => t.id === item.id) === index
    );
    const data = uniqueData.slice(0, limit);

    return NextResponse.json(data);
}
