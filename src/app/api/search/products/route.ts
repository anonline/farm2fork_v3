import type { NextRequest } from 'next/server';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { supabaseSSR } from 'src/lib/supabase-ssr';

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '3'), 50);
    const headerSearch = searchParams.get('hs') === 'true';

    if (!q || q.trim() === '') {
        return NextResponse.json({ error: 'Hiányzik a keresési kifejezés' }, { status: 400 });
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();
    

    const {data:roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('uid', user?.id ?? undefined)
        .single();

    const isVIP = roles?.is_vip || false;
    const isCORP = roles?.is_corp || false;
    

    const searchTerm = `%${q}%`;

    let baseQuery = `tags.ilike.${searchTerm},name.ilike.${searchTerm}`;

    if(q.split(' ').length > 1){
        baseQuery += `,name.ilike.%${q.replaceAll(' ', '%')}%`;
        q.split(' ').forEach((word) => {
            if(word.length > 0){
                baseQuery += `,name.ilike.%${word}%`;
            }
        });
    }
    

    let query = supabase
        .from('Products')
        .select('*, producer:Producers!left(*)', { count: 'exact' })
        .eq('publish', true)
        .or(baseQuery);

    if (isVIP) {
        query = query.eq('isVip', true);
    } else if (isCORP) {
        query = query.eq('isCorp', true);
    } else {
        query = query.eq('isPublic', true);
    }

    console.log(headerSearch);
    let productsResponse = await query;

    if (productsResponse.error) {
        return NextResponse.json(
            { error: 'Products: ' + productsResponse.error.message },
            { status: 500 }
        );
    }

    if(headerSearch){
        productsResponse.data = productsResponse.data.filter((p) => p.stock === null || (p.stock > 0 || p.backorder));
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

        if (producersProductsResponse.error) {
            return NextResponse.json(
                { error: "Producer's Products: " + producersProductsResponse.error.message },
                { status: 500 }
            );
        }

        if(headerSearch){
            producersProductsResponse.data = producersProductsResponse.data.filter((p) => p.stock === null || (p.stock > 0 || p.backorder));
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
    
    return NextResponse.json(uniqueData);
}
