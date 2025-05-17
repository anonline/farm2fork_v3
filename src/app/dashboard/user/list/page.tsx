import type { Metadata } from 'next';
import { getUsers } from 'src/actions/user-ssr';

import { CONFIG } from 'src/global-config';

import { UserListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `User list | Dashboard - ${CONFIG.appName}` };

export default async function Page() {
    const userList = await getUsers();
  
    return (
      <UserListView _userList={userList} />
    );
}
