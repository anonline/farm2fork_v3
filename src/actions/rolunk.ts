'use server';

import type { IRolunkWhat } from "src/types/rolunk/irolunkwhat";

import { cookies } from "next/headers";

import { supabaseSSR } from "src/lib/supabase-ssr";

const initSupabaseSSR = async () => {
    const cookieStore = await cookies();
    return await supabaseSSR(cookieStore);
}

export async function getRolunkWhat(): Promise<IRolunkWhat[]> {
    const supabase = await initSupabaseSSR();
    const { data, error } = await supabase
        .from('rolunkwhat')
        .select('*')
        .order('order', { ascending: true });
    if (error) {
        console.error('Error fetching "Rólunk - Mit csinálunk?" data:', error);
        return [];
    }
    return data as IRolunkWhat[];
}

export async function createRolunkWhat(item: Omit<IRolunkWhat, 'id'>): Promise<IRolunkWhat> {
    const supabase = await initSupabaseSSR();

    const { data, error } = await supabase
        .from('rolunkwhat')
        .insert([item])
        .select()
        .single();
    
    if (error) {
        console.error('Error creating "Rólunk - Mit csinálunk?" item:', error);
        throw new Error(error.message);
    }
    
    return data as IRolunkWhat;
}

export async function updateRolunkWhat(id: number | null, item: Partial<IRolunkWhat>): Promise<IRolunkWhat> {
    const supabase = await initSupabaseSSR();

    if (!id) {
        throw new Error('ID is required for updating an item');
    }

    const { error: updateError } = await supabase
        .from('rolunkwhat')
        .update(item)
        .eq('id', id);

    const { data, error: selectError } = await supabase
        .from('rolunkwhat')
        .select('*')
        .eq('id', id)
        .single();

    if (selectError) {
        console.error('Error fetching updated "Rólunk - Mit csinálunk?" item:', selectError, 'ID:', id);
        throw new Error(selectError.message);
    }

    if (updateError) {
        console.error('Error updating "Rólunk - Mit csinálunk?" item:', updateError, 'ID:', id);
        throw new Error(updateError.message);
    }
    console.log(item, data);
    if (!data) {
        throw new Error(`No item found with ID: ${id}`);
    }
    
    return data as IRolunkWhat;
}

export async function deleteRolunkWhat(id: number | null): Promise<void> {
    const supabase = await initSupabaseSSR();

    if (!id) {
        throw new Error('ID is required for deleting an item');
    }
    
    const { error } = await supabase
        .from('rolunkwhat')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error('Error deleting "Rólunk - Mit csinálunk?" item:', error, 'ID:', id);
        throw new Error(error.message);
    }
}

export async function reorderRolunkWhat(items: IRolunkWhat[]): Promise<void> {
    const supabase = await initSupabaseSSR();

    const updates = items.map((item, index) => 
        supabase
            .from('rolunkwhat')
            .update({ order: index })
            .eq('id', item.id)
    );
    
    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
        console.error('Error reordering "Rólunk - Mit csinálunk?" items:', errors);
        throw new Error('Failed to reorder items');
    }
}