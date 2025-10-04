import { cookies } from 'next/headers';
import { supabaseSSR } from 'src/lib/supabase-ssr';
import { IPickupLocation } from 'src/types/pickup-location';

export async function getPickupLocations() {
    const cookieStore = await cookies();
    const client = await supabaseSSR(cookieStore);
    const { data: locations, error } = await client
        .from('PickupLocations')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return locations as IPickupLocation[];
}
