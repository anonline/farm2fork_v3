import type { IRole, IUserItem, ICustomerData } from 'src/types/user';

import { supabase } from 'src/lib/supabase';

import { updateUserSSR, createUserSSR, deleteUserSSR } from './user-ssr';

// ----------------------------------------------------------------------
// Client-side user operations (can be used in client components)
// ----------------------------------------------------------------------

export async function upsertUserCustomerData(updates: Partial<ICustomerData>): Promise<boolean> {
    if (!updates.uid) {
        return false;
    }
    console.log('Updating user customer data...', updates);
    const { error: customerDataError } = await supabase
        .from('CustomerDatas')
        .upsert(updates)
        .eq('uid', updates.uid);

    if (customerDataError) throw customerDataError.message;

    return true;
}

export async function updateUserRole(id: string, roleUpdates: Partial<IRole>): Promise<boolean> {
    const { error } = await supabase
        .from('roles')
        .upsert(roleUpdates)
        .eq('uid', id);
    
    if (error) throw error.message;
    
    return true;
}

export async function addUser(userItem: Partial<IUserItem>, password: string | undefined): Promise<string> {
    console.log('Adding/updating user...', userItem);
    
    if (userItem.id) {
        // Update existing user using SSR admin client
        const userId = await updateUserSSR(userItem.id, {
            email: userItem.email,
            password,
            roles: userItem.role as IRole
        });
        return userId;
    }

    // Create new user using SSR admin client
    if (!userItem.email || !password) {
        throw new Error('Email és jelszó megadása kötelező új felhasználó létrehozásához');
    }

    const userId = await createUserSSR({
        email: userItem.email,
        password,
        roles: userItem.role as IRole
    });
    
    return userId;
}

export async function deleteUser(id: string): Promise<boolean> {
    console.log('Deleting user...', id);
    
    if (!id) {
        throw new Error('Felhasználó azonosító megadása kötelező');
    }

    // Delete user using SSR admin client
    const success = await deleteUserSSR(id);
    
    return success;
}