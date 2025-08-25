import { Container } from '@mui/material';

import { MainLayout } from 'src/layouts/main';

import { GuestGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
    return (
        <GuestGuard>
            <MainLayout>
                <Container>
                    {children}
                </Container>
            </MainLayout>
        </GuestGuard>
    );
}
