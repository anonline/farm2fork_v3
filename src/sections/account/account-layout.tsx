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
    },
    {
        label: 'Számlázás',
        icon: <Iconify width={24} icon="solar:bill-list-bold" />,
        href: `${paths.dashboard.user.account}/billing`,
    },
    {
        label: 'Szállítás',
        icon: <Iconify width={24} icon="carbon:delivery" />,
        href: `${paths.dashboard.user.account}/shipping`,
    },
    {
        label: 'Notifications',
        icon: <Iconify width={24} icon="solar:bell-bing-bold" />,
        href: `${paths.dashboard.user.account}/notifications`,
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

    // Find the matching tab value, preserving ID if present
    const getCurrentTabValue = () => {
        const cleanPathname = removeLastSlash(pathname);
        
        // Check if we have an ID at the end (UUID pattern)
        const idMatch = cleanPathname.match(/\/([a-f0-9-]{36})$/);
        const userId = idMatch ? idMatch[1] : null;
        
        // Find the base tab that matches (without the ID)
        const basePathname = userId ? cleanPathname.replace(`/${userId}`, '') : cleanPathname;
        const matchingTab = NAV_ITEMS.find(tab => tab.href === basePathname);
        
        // Return the tab href with ID preserved if it exists
        if (matchingTab && userId) {
            return `${matchingTab.href}/${userId}`;
        }
        
        return matchingTab ? matchingTab.href : NAV_ITEMS[0].href;
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
                {NAV_ITEMS.map((tab) => {
                    const cleanPathname = removeLastSlash(pathname);
                    const idMatch = cleanPathname.match(/\/([a-f0-9-]{36})$/);
                    const userId = idMatch ? idMatch[1] : null;
                    const tabHref = userId ? `${tab.href}/${userId}` : tab.href;
                    
                    return (
                        <Tab
                            component={RouterLink}
                            key={tab.href}
                            label={tab.label}
                            icon={tab.icon}
                            value={tabHref}
                            href={tabHref}
                        />
                    );
                })}
            </Tabs>

            {children}
        </DashboardContent>
    );
}
