import type { IRole, IUserItem, ICustomerData } from 'src/types/user';

import { supabase } from 'src/lib/supabase';

import { getUserAdmin, getUserRoles, getUsersAdmin, getUsersRoles } from './user-ssr';

export async function getUsers(page: number = 1, limit: number = 25): Promise<IUserItem[]> {
    const { data: fetchedCustomerData, error: customerDataError } = await supabase
        .from('CustomerDatas')
        .select('*');
    if (customerDataError) throw customerDataError.message;

    const roles = await getUsersRoles();
    const supabaseUsers = await getUsersAdmin(page, limit);

    const userList = supabaseUsers.map((user) => {
        const selectedCustomerData =
            fetchedCustomerData.find(
                (customerData: ICustomerData) => customerData.uid === user.id
            ) || null;
        const roleData =
            roles.find((role: IRole) => role.uid === user.id) ||
            ({ is_admin: false, is_vip: false, is_corp: false, uid: user.id } as IRole);
        return {
            id: user.id,
            name:
                `${selectedCustomerData?.lastname || ''} ${selectedCustomerData?.firstname || ''}`.trim() ||
                user.email,
            email: user.email,
            role: roleData,
            customerData: selectedCustomerData,
            createdAt: user.created_at,
        } as IUserItem;
    });

    return userList;
}

export async function getUser(id: string): Promise<IUserItem | undefined> {
    const { data: customerData, error: customerDataError } = await supabase
        .from('CustomerDatas')
        .select('*')
        .eq('uid', id)
        .single();

    if (customerDataError) throw customerDataError.message;

    const roles = await getUserRoles(id);
    const supabaseUser = await getUserAdmin(id);

    const userList = {
        id: supabaseUser.id,
        name:
            `${customerData?.lastname || ''} ${customerData?.firstname || ''}`.trim() || supabaseUser.email,
        email: supabaseUser.email,
        role: roles as IRole,
        customerData: customerData as ICustomerData,
        createdAt: supabaseUser.created_at,
    } as IUserItem;

    return userList;
}
