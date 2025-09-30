import type { NextRequest } from 'next/server';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { supabaseSSR } from 'src/lib/supabase-ssr';

export async function GET(req: NextRequest) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json({ error: 'Hiányzik a keresési kifejezés' }, { status: 400 });
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .eq('uid', user?.id ?? undefined)
        .single();

    const isVIP = roles?.is_vip || false;
    const isCORP = roles?.is_corp || false;

    const searchTerm = `%${q}%`;

    let query = supabase
        .from('Products')
        .select('producerId')
        .eq('publish', true)
        .or(`tags.ilike.${searchTerm},name.ilike.${searchTerm}`);

    if (isVIP) {
        query = query.eq('isVip', true);
    } else if (isCORP) {
        query = query.eq('isCorp', true);
    } else {
        query = query.eq('isPublic', true);
    }

    const { data: matchingProducts } = await query;

    const matchingProducerIds =
        matchingProducts?.filter((p) => !!p.producerId).map((p) => p.producerId) ?? [];

    const searchConditions = [
        `name.ilike.${searchTerm}`,
        `location.ilike.${searchTerm}`,
        `shortDescription.ilike.${searchTerm}`,
        `producingTags.ilike.${searchTerm}`,
        `companyName.ilike.${searchTerm}`,
    ];

    if (matchingProducerIds.length > 0) {
        const producerIdsCondition = `id.in.(${matchingProducerIds.join(',')})`;
        searchConditions.push(producerIdsCondition);
    }

    const { data, error } = await supabase
        .from('Producers')
        .select('*')
        .eq('enabled', true)
        .or(searchConditions.join(','));

    if (error) {
        return NextResponse.json({ error: error?.message }, { status: 500 });
    }


    if (Array.isArray(data)) {
        data.forEach((producer) => {
            if (typeof producer.shortDescription === 'string') {
                producer.shortDescription = producer.shortDescription.replaceAll(
                    /&([a-zA-Z]+);/g,
                    (match: string, entity: string): string => {
                        const entities: Record<string, string> = {
                            'eacute': 'é',
                            'aacute': 'á',
                            'iacute': 'í',
                            'oacute': 'ó',
                            'uacute': 'ú',
                            'Eacute': 'É',
                            'Aacute': 'Á',
                            'Iacute': 'Í',
                            'Oacute': 'Ó',
                            'Uacute': 'Ú',
                            'ouml': 'ö',
                            'uuml': 'ü',
                            'Ouml': 'Ö',
                            'Uuml': 'Ü',
                            'szlig': 'ß',
                            'amp': '&',
                            'quot': '"',
                            'lt': '<',
                            'gt': '>',
                            'apos': "'",
                        };
                        return entities[entity] || match;
                    }
                );
            }
        });
    }
    return NextResponse.json(data);
}
