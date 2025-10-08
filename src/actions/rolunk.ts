import { supabase } from "src/lib/supabase";
import { IRolunkWhat } from "src/types/rolunk/irolunkwhat";

export async function getRolunkWhat(): Promise<IRolunkWhat[]> {
    const { data, error } = await supabase
        .from('rolunkwhat')
        .select('*')
        .order('order', { ascending: true });
    if (error) {
        console.error('Error fetching "Rólunk - Mit csinálunk?" data:', error);
        return [];
    }
    return data as IRolunkWhat[];
};