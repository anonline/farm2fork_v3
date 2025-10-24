'use server';

import { cookies } from "next/headers";

import { supabaseSSR } from "src/lib/supabase-ssr";

/*import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export async function getProducts() {
    const res = await axios.get(endpoints.product.list);

    return res.data;
}

// ----------------------------------------------------------------------

export async function getProduct(id: string) {
    const URL = id ? `${endpoints.product.details}?productId=${id}` : '';

    const res = await axios.get(URL);

    return res.data;
}*/
async function initSupabaseSSR() {
    const cookieStore = await cookies();
    return await supabaseSSR(cookieStore);
}


export async function updateProductStock(productId: string, stock: number | null, backorder: boolean) {
    const supabase = await initSupabaseSSR();

    const { data, error } = await supabase
        .from('Products')
        .update({ stock, backorder })
        .eq('id', productId)
        .select();

    if (error) {
        console.error('Error updating product stock:', error);
        throw error;
    }

    if(data.length > 1) {
        console.warn('Warning: Multiple products updated when only one was expected.');
        throw new Error('Multiple products stock updated');
    }

    if(data.length === 0) {
        console.error('Error: No product found with the given ID to update stock.');
        throw new Error('No product found to update stock');
    }

    return data.length === 1;
}

