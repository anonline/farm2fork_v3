import type { IUserItem } from 'src/types/user';

import { cookies } from 'next/headers';

import { supabaseAdmin } from 'src/lib/supabase-ssr';

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
