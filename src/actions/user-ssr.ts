'use server';

import type { IRole, IUserItem } from 'src/types/user';
import type { ICustomerData } from 'src/types/customer';

import { cookies } from 'next/headers';

import { supabaseSSR, supabaseAdmin } from 'src/lib/supabase-ssr';

// ----------------------------------------------------------------------

export async function getUsers() {
    const cookieStore = await cookies();
    const client = await supabaseAdmin(cookieStore);
    const supabaseSSRClient = await supabaseSSR(cookieStore);

    const response = await client.listUsers({ page: 1, perPage: 10000 });
        if (response.error) throw response.error.message;
    
    const { data:roles } = await supabaseSSRClient.from('roles').select('*').range(0, 10000);


    const users = response.data.users.map((user) => ({
        id: user.id,
        name: user.user_metadata?.name ?? '',
        email: user.email ?? '',
        role: roles?.find(r=>r.uid === user.id) || { is_admin: false, is_vip: false, is_corp: false, uid: user.id },
        avatarUrl: user.user_metadata?.avatar_url ?? '',
        city: user.user_metadata?.city ?? '',
        state: user.user_metadata?.state ?? '',
        status: user.user_metadata?.status ?? '',
        address: user.user_metadata?.address ?? '',
        phone: user.user_metadata?.phone ?? '',
        zip: user.user_metadata?.zip ?? '',
        country: user.user_metadata?.country ?? '',
        createdAt: user.created_at ?? '',
    })) as IUserItem[];
    return users;
}

// ----------------------------------------------------------------------

export async function getUserById(id: string): Promise<IUserItem> {
    const cookieStore = await cookies();
    const client = await supabaseAdmin(cookieStore);
    const response = await client.getUserById(id);

    if (response.error) throw response.error.message;
    const user = response.data.user;

    return {
        id: user.id,
        name: user.user_metadata?.name ?? '',
        email: user.email ?? '',
        role: user.user_metadata?.role ?? '',
        avatarUrl: user.user_metadata?.avatar_url ?? '',
        city: user.user_metadata?.city ?? '',
        state: user.user_metadata?.state ?? '',
        status: user.user_metadata?.status ?? '',
        address: user.user_metadata?.address ?? '',
        phone: user.user_metadata?.phone ?? '',
        zip: user.user_metadata?.zip ?? '',
        country: user.user_metadata?.country ?? '',
        createdAt: user.created_at ?? '',
    } as IUserItem;
}

export async function getUsersAdmin(page: number = 1, perPage: number = 10000) {
    const cookieStore = await cookies();
    const client = await supabaseAdmin(cookieStore);

    const response = await client.listUsers({ page, perPage });

    if (response.error) throw response.error.message;

    return response.data.users;
}

export async function getUserByEmailAdmin(email: string) {
    const users = await getUsersAdmin();

    return users.find((user) => user.email === email);
}

export async function setUserPassword(id: string, password: string) {
    const cookieStore = await cookies();
    const adminClient = await supabaseAdmin(cookieStore);

    const { data, error } = await adminClient.updateUserById(id, {
        password,
        email_confirm: true,
    });
    if (error) throw error.message;

    return data.user.id;
}
        

export async function getUserAdmin(id: string) {
    const cookieStore = await cookies();
    const client = await supabaseAdmin(cookieStore);

    const response = await client.getUserById(id);

    if (response.error) throw response.error.message;

    return response.data.user;
}

export async function getUserByWooId(wooId: number) {
    const cookieStore = await cookies();
    const client = await supabaseSSR(cookieStore);
    const { data, error } = await client.from('wp_users').select('uid').eq('id', wooId).single();
    if (error) throw error.message;
    return await getUserAdmin(data.uid);
}

export async function getUsersRoles() {
    const cookieStore = await cookies();
    const client = await supabaseSSR(cookieStore);
    const { data, error } = await client.from('roles').select('*');
    if (error) throw error.message;
    return data as IRole[];
}

export async function getUserRoles(id: string) {
    const cookieStore = await cookies();
    const client = await supabaseSSR(cookieStore);
    const { data, error } = await client.from('roles').select('*').eq('uid', id).single();
    if (error) throw error.message;
    return data;
}

export async function updateUserSSR(
    userId: string,
    userUpdates: { email?: string; password?: string; roles: IRole }
) {
    const cookieStore = await cookies();
    const adminClient = await supabaseAdmin(cookieStore);
    const ssrClient = await supabaseSSR(cookieStore);

    const { data, error } = await adminClient.updateUserById(userId, {
        email: userUpdates.email,
        password: userUpdates.password,
        email_confirm: true,
    });
    if (error) throw error.message;

    const { error: roleError } = await ssrClient.from('roles').insert({
        uid: data.user.id,
        is_admin: userUpdates.roles.is_admin,
        is_vip: userUpdates.roles.is_vip,
        is_corp: userUpdates.roles.is_corp,
    });
    if (roleError) throw roleError.message;

    return data.user.id;
}

export async function createUserSSR(userItem: { email: string; password: string; roles: Partial<IRole>; firstname?: string; lastname?: string }) {
    const cookieStore = await cookies();
    const adminClient = await supabaseAdmin(cookieStore);
    const ssrClient = await supabaseSSR(cookieStore);

    const { data, error } = await adminClient.createUser({
        email: userItem.email,
        password: userItem.password,
        email_confirm: true,
        user_metadata: {
            display_name: `${userItem.lastname || ''} ${userItem.firstname || ''}`.trim(),
            firstname: userItem.firstname || '',
            lastname: userItem.lastname || '',
        },
    });

    if (error) throw error.message;

    const { error: roleError } = await ssrClient.from('roles').insert({
        uid: data.user.id,
        is_admin: userItem.roles.is_admin,
        is_vip: userItem.roles.is_vip,
        is_corp: userItem.roles.is_corp,
    });

    if (roleError) throw roleError.message;

    return data.user.id;
}

export async function createUserRolesSSR(roles: IRole) {
    const cookieStore = await cookies();
    const client = await supabaseSSR(cookieStore);

    const { error } = await client.from('roles').insert(roles);

    if (error) throw error.message;

    return true;
}

// ----------------------------------------------------------------------

export async function deleteUserSSR(id: string): Promise<boolean> {
    const cookieStore = await cookies();
    const adminClient = await supabaseAdmin(cookieStore);

    // Delete user from auth
    const { error } = await adminClient.deleteUser(id);

    if (error) throw error.message;

    return true;
}

export async function createCustomerDataSSR(customerData: Partial<ICustomerData>) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);

    const { error: dbError } = await supabase.from('CustomerDatas').insert(customerData);
    if (dbError) throw dbError.message;

    return true;
}
