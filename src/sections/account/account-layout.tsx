'use client';

import type { DashboardContentProps } from 'src/layouts/dashboard';

import { removeLastSlash } from 'minimal-shared/utils';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

const NAV_ITEMS = [
    {
        label: 'Általános',
        icon: <Iconify width={24} icon="solar:user-id-bold" />,
        href: paths.dashboard.user.account,
        disabled: true
    },
    {
        label: 'Számlázás',
        icon: <Iconify width={24} icon="solar:bill-list-bold" />,
        href: `${paths.dashboard.user.account}/billing`,
        disabled: true
    },
    {
        label: 'Szállítás',
        icon: <Iconify width={24} icon="carbon:delivery" />,
        href: `${paths.dashboard.user.account}/shipping`,
        disabled: true
    },
    {
        label: 'Rendelések',
        icon: <Iconify width={24} icon="solar:bell-bing-bold" />,
        href: `${paths.dashboard.user.account}/notifications`,
        disabled: true
    },
    /*{
        label: 'Social links',
        icon: <Iconify width={24} icon="solar:share-bold" />,
        href: `${paths.dashboard.user.account}/socials`,
    },*/
    /*{
        label: 'Biztonság',
        icon: <Iconify width={24} icon="ic:round-vpn-key" />,
        href: `${paths.dashboard.user.account}/change-password`,
    },*/
];

// ----------------------------------------------------------------------

export function AccountLayout({ children, ...other }: DashboardContentProps) {
    const pathname = usePathname();

    // Extract user ID from pathname - it comes after /account/ and before any sub-route
    // Pattern: /dashboard/user/account/[id] or /dashboard/user/account/[id]/billing etc.
    const extractUserId = () => {
        const cleanPathname = removeLastSlash(pathname);
        const accountPath = paths.dashboard.user.account;
        
        if (!cleanPathname.startsWith(accountPath)) return null;
        
        // Get the part after /account/
        const afterAccount = cleanPathname.substring(accountPath.length + 1);
        
        // Extract UUID (first segment after /account/)
        const uuidPattern = /^([a-f0-9-]{36})/;
        const idMatch = uuidPattern.exec(afterAccount);
        return idMatch ? idMatch[1] : null;
    };

    const userId = extractUserId();

    // Find the matching tab value
    const getCurrentTabValue = () => {
        const cleanPathname = removeLastSlash(pathname);
        
        if (!userId) {
            // No user ID, match directly
            const matchingTab = NAV_ITEMS.find(tab => tab.href === cleanPathname);
            return matchingTab ? matchingTab.href : NAV_ITEMS[0].href;
        }
        
        // With user ID, check if pathname ends with a sub-route
        // Pattern: /dashboard/user/account/[id]/billing
        const accountPath = `${paths.dashboard.user.account}/${userId}`;
        
        if (cleanPathname === accountPath) {
            // Base account page
            return accountPath;
        }
        
        // Check for sub-routes
        const subRoute = cleanPathname.substring(accountPath.length);
        const matchingTab = NAV_ITEMS.find(tab => {
            const tabSubRoute = tab.href.substring(paths.dashboard.user.account.length);
            return tabSubRoute === subRoute;
        });
        
        return matchingTab ? `${accountPath}${subRoute}` : accountPath;
    };

    return (
        <DashboardContent {...other}>
            <CustomBreadcrumbs
                heading="Felhasználói fiók"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Felhasználók', href: paths.dashboard.user.root },
                    { name: 'Fiók' },
                ]}
                sx={{ mb: 3 }}
            />

            <Tabs value={getCurrentTabValue()} sx={{ mb: { xs: 3, md: 5 } }}>
                {NAV_ITEMS.map((tab, index) => {
                    // Build the correct href based on whether we have a userId
                    let tabHref = tab.href;
                    
                    if (userId) {
                        // Insert userId between /account and the sub-route
                        const accountPath = paths.dashboard.user.account;
                        const subRoute = tab.href.substring(accountPath.length);
                        tabHref = `${accountPath}/${userId}${subRoute}`;
                    }
                    
                    return (
                        <Tab
                            component={RouterLink}
                            key={tab.href}
                            label={tab.label}
                            icon={tab.icon}
                            value={tabHref}
                            href={tabHref}
                            disabled={ index == 0 ? false : userId == null }
                        />
                    );
                })}
            </Tabs>

            {children}
        </DashboardContent>
    );
}
