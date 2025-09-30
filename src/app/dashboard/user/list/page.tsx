import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { getUsers as getUsersClient } from 'src/actions/user-management';

import { UserListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `User list | Dashboard - ${CONFIG.appName}` };

export default async function Page() {
    const userList = await getUsersClient(1,10000);

    return <UserListView _userList={userList} />;
}
