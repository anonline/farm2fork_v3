import type { IUserItem } from 'src/types/user';

import { cookies } from 'next/headers';

import { supabaseAdmin, supabaseSSR } from 'src/lib/supabase-ssr';

// ----------------------------------------------------------------------

export async function getUsers() {
    const cookieStore = await cookies();
    const adminClient = await supabaseAdmin(cookieStore);

    const response = await adminClient.listUsers();

    if (response.error) throw response.error.message;

    let users = response.data.users.map((user) => ({
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
    }) as IUserItem);

    const customers = await getAllCustomerData();
    users = users.map((user)=>{
        const cdata = customers?.find((c)=>c.uid == user.id);
        user.newsletterConsent = cdata.newsletterConsent;
        user.company = cdata.companyName ?? "";
        return user;
    });

    const roles = await getAllProfileData();
    users = users.map((user)=>{
        const role = roles?.find((r)=>r.user_id == user.id);
        user.is_admin = role?.is_admin ?? false;
        user.is_vip = role?.is_vip ?? false;
        user.is_company = role?.is_corp ?? false;
        user.is_personal = !role?.is_admin && !role?.is_corp && !role?.is_vip;

        if(user.is_admin){
            user.role = "Admin";
        }
        else if(user.is_vip){
            user.role = "VIP";
        }
        else if(user.is_company){
            user.role = "Céges";
        }
        else{
            user.role = "Magánszemély";
        }
        return user;
    });

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

async function getAllCustomerData() {
    const cookieStore = await cookies();
    const client = await supabaseSSR(cookieStore);
    const { data, error } = await client.from('CustomerDatas').select('*');
    if (error) return;
    return data;
}

async function getAllProfileData() {
    const cookieStore = await cookies();
    const client = await supabaseSSR(cookieStore);
    const { data, error } = await client.from('profiles').select('*');
    console.log(data);
    if (error) return;
    return data;
}
