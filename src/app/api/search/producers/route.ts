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

    let baseQuery = `tags.ilike.${searchTerm},name.ilike.${searchTerm}`;

    if(q.split(' ').length > 1){
        baseQuery += `,name.ilike.%${q.replaceAll(' ', '%')}%`;
        q.split(' ').forEach((word) => {
            if(word.length > 0){
                baseQuery += `,name.ilike.%${word}%`;
            }
        });
    }

    const normalizeText = (text: string): string => {
        const hungarianChars = ['á', 'é', 'í', 'ó', 'ö', 'ő', 'ú', 'ü', 'ű', 'Á', 'É', 'Í', 'Ó', 'Ö', 'Ő', 'Ú', 'Ü', 'Ű'];
        const replacementChars = ['a', 'e', 'i', 'o', 'o', 'o', 'u', 'u', 'u', 'A', 'E', 'I', 'O', 'O', 'O', 'U', 'U', 'U'];
        
        let normalized = text;
        hungarianChars.forEach((char, index) => {
            normalized = normalized.replaceAll(char, replacementChars[index]);
        });
        return normalized;
    };

    const normalizedQ = normalizeText(q);
    
    // Add normalized search terms for both directions
    if(normalizedQ !== q){
        const normalizedSearchTerm = `%${normalizedQ}%`;
        baseQuery += `,name.ilike.${normalizedSearchTerm},tags.ilike.${normalizedSearchTerm}`;
    }
    
    // Add reverse normalization - search for accented versions of non-accented input
    const reverseNormalizedTerms: string[] = [];
    const searchWords = q.toLowerCase().split(' ');
    
    searchWords.forEach(word => {
        // Generate potential accented variations for the whole word
        const generateVariations = (text: string): string[] => {
            const variations = new Set([text]);
            
            // Common Hungarian letter substitutions when searching without accents
            const commonSubstitutions: { [key: string]: string[] } = {
                'o': ['ó', 'ö', 'ő'],
                'e': ['é'],
                'a': ['á'],
                'u': ['ú', 'ü', 'ű'],
                'i': ['í']
            };
            
            // Generate all possible combinations of substitutions
            const chars = text.split('');
            const generateCombinations = (index: number, current: string): void => {
                if (index >= chars.length) {
                    variations.add(current);
                    return;
                }
                
                const char = chars[index];
                const substitutions = commonSubstitutions[char] || [char];
                
                // Try original character
                generateCombinations(index + 1, current + char);
                
                // Try all substitutions for this character
                if (commonSubstitutions[char]) {
                    substitutions.forEach(sub => {
                        generateCombinations(index + 1, current + sub);
                    });
                }
            };
            
            generateCombinations(0, '');
            return Array.from(variations);
        };
        
        const variations = generateVariations(word);
        variations.forEach(variation => {
            if (variation !== word) {
                reverseNormalizedTerms.push(`%${variation}%`);
            }
        });
    });
    
    // Add reverse normalized search terms
    reverseNormalizedTerms.forEach(term => {
        baseQuery += `,name.ilike.${term},tags.ilike.${term}`;
    });


    let query = supabase
        .from('Products')
        .select('producerId')
        .eq('publish', true)
        .or(baseQuery);

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
