import { supabase } from "src/lib/supabase";
import { ICustomerData, IRole, IUserItem } from "src/types/user";
import { getUsersAdmin, getUsersRoles } from "./user-ssr";

export async function getUsers(page: number = 1, limit: number = 25) : Promise<IUserItem[]> {
    const { data: fetchedCustomerData, error: customerDataError } = await supabase.from('CustomerDatas').select('*');
    if (customerDataError) throw customerDataError.message;

    const roles = await getUsersRoles();   
    const supabaseUsers = await getUsersAdmin(page, limit);
    
    const userList = supabaseUsers.map(user => {
        const customerData = fetchedCustomerData.find((customerData: ICustomerData) => customerData.uid === user.id) || null;
        const roleData = roles.find((role: IRole) => role.uid === user.id) || {is_admin: false, is_vip: false, is_corp: false, uid: user.id} as IRole;
        return {
            id: user.id,
            name: `${customerData?.lastname || ''} ${customerData?.firstname || ''}`.trim() || user.email,
            email: user.email,
            role: roleData,
            customerData: customerData,
            createdAt: user.created_at,
        } as IUserItem; 
    });

    return userList;
}