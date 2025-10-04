import type { IDeliveryPerson } from 'src/types/delivery';

import { cookies } from 'next/headers';

import { supabaseSSR } from 'src/lib/supabase-ssr';

export async function getDelivery(id: string) : Promise<IDeliveryPerson | null> {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);

    if(!id) return null;

    const { data: delivery, error: dbError } = await supabase
        .from('Delivery')
        .select('*')
        .eq('id', id)
        .single();

    if (dbError) throw new Error(dbError.message);
    return delivery;
}
