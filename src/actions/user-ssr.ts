'use server'

import type { IUserItem } from 'src/types/user';

import { cookies } from 'next/headers';

import { supabaseAdmin, supabaseSSR } from 'src/lib/supabase-ssr';

// ----------------------------------------------------------------------

export async function getUsers() {
    const cookieStore = await cookies();
    const client = await supabaseAdmin(cookieStore);

    const response = await client.listUsers();

    if (response.error) throw response.error.message;

    const users = response.data.users.map((user) => ({
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

export async function getUserAdmin(id:string) {
    const cookieStore = await cookies();
    const client = await supabaseAdmin(cookieStore);

    const response = await client.getUserById(id);

    if (response.error) throw response.error.message;

    return response.data.user;
}

export async function getUsersRoles() {
    const cookieStore = await cookies();
    const client = await supabaseSSR(cookieStore);
    const { data, error } = await client.from('roles').select('*');
    if (error) throw error.message;
    return data;
}

export async function getUserRoles(id:string) {
    const cookieStore = await cookies();
    const client = await supabaseSSR(cookieStore);
    const { data, error } = await client.from('roles').select('*').eq('uid', id).single();
    if (error) throw error.message;
    return data;
}

export async function updateUserSSR(userId: string, userUpdates: { email?: string; password?: string }) {
    const cookieStore = await cookies();
    const adminClient = await supabaseAdmin(cookieStore);

    const { data, error } = await adminClient.updateUserById(userId, {
        email: userUpdates.email,
        password: userUpdates.password,
        email_confirm: true,
    });

    if (error) throw error.message;
    return data.user.id;
}

export async function createUserSSR(userItem: { email: string; password: string }) {
    const cookieStore = await cookies();
    const adminClient = await supabaseAdmin(cookieStore);

    const { data, error } = await adminClient.createUser({
        email: userItem.email,
        password: userItem.password,
        email_confirm: true,
    });

    if (error) throw error.message;
    return data.user.id;
}