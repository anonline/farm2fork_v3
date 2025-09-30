import { supabase } from 'src/lib/supabase';
import { ICustomerData, IRole, IUserItem } from 'src/types/user';

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
    if(userItem.id) {
        const { data, error } = await supabase.auth.admin.updateUserById(userItem.id, {
            email: userItem.email,
            password: password,
            email_confirm: true,
        });
        if (error) throw error.message;
    
        return data.user.id;    
    }

    const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: userItem.email,
        password: password,
        email_confirm: true,
    });
    if (userError) throw userError.message;

    return user.user.id;
}