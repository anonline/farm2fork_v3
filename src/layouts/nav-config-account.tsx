import { Iconify } from 'src/components/iconify';

import type { AccountDrawerProps } from './components/account-drawer';

// ----------------------------------------------------------------------

export const _account: AccountDrawerProps['data'] = [
    { label: 'Főoldal', href: '/', icon: <Iconify icon="solar:home-angle-bold-duotone" /> },
    {
        label: 'Profil',
        href: '#',
        icon: <Iconify icon="custom:profile-duotone" />,
    },
    {
        label: 'Rendelések',
        href: '#',
        icon: <Iconify icon="solar:notes-bold-duotone" />,
        info: '3',
    },
    { label: 'Biztonság', href: '#', icon: <Iconify icon="solar:shield-keyhole-bold-duotone" /> },
    { label: 'Fiók beállítások', href: '#', icon: <Iconify icon="solar:settings-bold-duotone" /> },
];
