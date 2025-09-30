'use client';

import type { IUserItem } from 'src/types/user';

import { AccountGeneral } from '../account-general';

// ----------------------------------------------------------------------

export function AccountGeneralView({ user }: { user?: IUserItem }) {
    return <AccountGeneral user={user} />;
}
