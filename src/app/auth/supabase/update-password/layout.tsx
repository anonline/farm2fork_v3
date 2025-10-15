import { Container } from '@mui/material';

import { MainLayout } from 'src/layouts/main';

import { ProfileGuard } from 'src/auth/guard/profile-guard';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Props) {
    return <ProfileGuard><MainLayout><Container>{children}</Container></MainLayout></ProfileGuard>;
}
