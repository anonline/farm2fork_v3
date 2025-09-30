import type { Metadata } from 'next';
import { getUser } from 'src/actions/user-management';

import { CONFIG } from 'src/global-config';


import { UserEditView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `User edit | Dashboard - ${CONFIG.appName}` };

type Props = {
    params: Promise<{ id: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
    const { id } = await params;
    const currentUser = await getUser(id);

    if(!currentUser) {
        throw new Error('User not found');
    }
    
    return <UserEditView user={currentUser} />;
}

// ----------------------------------------------------------------------

/**
 * Static Exports in Next.js
 *
 * 1. Set `isStaticExport = true` in `next.config.{mjs|ts}`.
 * 2. This allows `generateStaticParams()` to pre-render dynamic routes at build time.
 *
 * For more details, see:
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 *
 * NOTE: Remove all "generateStaticParams()" functions if not using static exports.
 */
/*export async function generateStaticParams() {
  const data: IUserItem[] = CONFIG.isStaticExport ? _userList : _userList.slice(0, 1);

  return data.map((user) => ({
    id: user.id,
  }));
}*/
