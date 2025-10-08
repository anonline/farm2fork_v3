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

    console.log('Search baseQuery:', baseQuery);
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
   
    const productsResponse = await query;

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

    // Calculate relevance score for each product
    const calculateRelevance = (product: any, searchQuery: string, isFromProducer: boolean): number => {
        let score = 0;
        const queryLowercase = searchQuery.toLowerCase();
        const name = (product.name || '').toLowerCase();
        const tags = (product.tags || '').toLowerCase();

        // Check if product is in stock
        const isInStock = product.stock === null || product.backorder === true || (product.stock > 0);
        
        // Out of stock products get massive negative score to appear last
        if (!isInStock) {
            score -= 1000000;
        }

        // Exact name match (highest priority)
        if (name === queryLowercase) {
            score += 1000;
        }
        // Name starts with query
        else if (name.startsWith(queryLowercase)) {
            score += 500;
        }
        // Name contains query at word boundary
        else if (name.includes(` ${queryLowercase}`) || name.includes(`-${queryLowercase}`)) {
            score += 300;
        }
        // Name contains query anywhere
        else if (name.includes(queryLowercase)) {
            score += 200;
        }

        // Multi-word match bonus
        if (queryLowercase.includes(' ')) {
            const queryWords = queryLowercase.split(' ').filter(w => w.length > 0);
            const matchedWords = queryWords.filter(word => name.includes(word));
            score += matchedWords.length * 50;
        }

        // Tag match (lower priority than name)
        if (tags.includes(queryLowercase)) {
            score += 100;
        }

        // Producer match (lowest priority)
        if (isFromProducer) {
            score += 50;
        }

        // Shorter names rank higher for same match quality
        score -= name.length * 0.1;

        return score;
    };

    const combinedData = [
        ...(productsResponse.data.map((p) => ({ 
            ...p, 
            isFromProducer: false,
            relevanceScore: calculateRelevance(p, q, false)
        })) ?? []),
        ...(producersProducts.map((p) => ({ 
            ...p, 
            isFromProducer: true,
            relevanceScore: calculateRelevance(p, q, true)
        })) ?? []),
    ];

    const uniqueData = combinedData
        .filter((item, index, array) => array.findIndex((t) => t.id === item.id) === index)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return NextResponse.json(uniqueData);
}
