import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { getUsers } from 'src/actions/user-ssr';

import { OverviewAppView } from 'src/sections/overview/app/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default async function Page() {
    const totalUser = await getUsers();
    const totalUsersCount = totalUser.length;
    const usersByMonthAtLastYear: number[] = Array.from({ length: 12 }, (_, i) => {
        const now = new Date();
        const month = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const count = totalUser.filter(user => {
            if (!user.createdAt) return false;
            const createdAt = new Date(user.createdAt);
            return (
                createdAt.getFullYear() === month.getFullYear() &&
                createdAt.getMonth() === month.getMonth()
            );
        }).length;
        return count;
    });

    const newUsersPercentFromLastThirtyDays = ((totalUser.filter(user => {
        if (!user.createdAt) return false;
        const createdAt = new Date(user.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt >= thirtyDaysAgo;
    }).length / totalUsersCount) * 100) || 0;

    return <OverviewAppView totalUsers={totalUsersCount} usersByMonthAtLastYear={usersByMonthAtLastYear} newUsersPercent={newUsersPercentFromLastThirtyDays} />;
}
