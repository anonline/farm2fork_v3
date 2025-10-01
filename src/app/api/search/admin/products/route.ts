import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ?? '' // Using service key for admin access
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.trim() === '') {
        return NextResponse.json({ error: 'Hiányzik a keresési kifejezés' }, { status: 400 });
    }

    const searchTerm = `%${q}%`;

    try {
        // Search products by name, SKU, or tags - no publish filter for admin
        const { data: products, error } = await supabase
            .from('Products')
            .select(`
                id,
                sku,
                name,
                shortDescription,
                featuredImage,
                url,
                unit,
                bio,
                grossPrice,
                salegrossPrice,
                netPrice,
                netPriceVIP,
                netPriceCompany,
                vat,
                stepQuantity,
                mininumQuantity,
                maximumQuantity,
                featured,
                star,
                tags,
                publish,
                images,
                usageInformation,
                storingInformation,
                producerId,
                stock,
                backorder,
                type,
                seasonality,
                cardText,
                createdAt,
                isVip,
                isCorp,
                isPublic,
                producer:Producers(
                    id,
                    name,
                    companyName,
                    location
                )
            `)
            .or(`name.ilike.${searchTerm},sku.ilike.${searchTerm},tags.ilike.${searchTerm},shortDescription.ilike.${searchTerm}`)
            .order('name', { ascending: true });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: 'Adatbázis hiba: ' + error.message },
                { status: 500 }
            );
        }

        // Transform the data to include proper image URLs and ensure all required fields
        const transformedProducts = products?.map(product => ({
            ...product,
            coverUrl: product.featuredImage || '',
            // Ensure numeric fields are properly typed
            netPrice: Number(product.netPrice) || 0,
            vat: Number(product.vat) || 0,
            stock: product.stock !== null ? Number(product.stock) : null,
            stepQuantity: Number(product.stepQuantity) || 1,
            mininumQuantity: Number(product.mininumQuantity) || 1,
            maximumQuantity: Number(product.maximumQuantity) || 999,
            // Add fields needed for order management
            inventoryType: product.stock !== null ? 'track' : 'none', // Infer from stock field
        })) || [];

        return NextResponse.json(transformedProducts);

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Váratlan hiba történt' },
            { status: 500 }
        );
    }
}