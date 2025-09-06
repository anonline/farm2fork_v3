import { Container } from '@mui/material';

import { MainLayout } from 'src/layouts/main';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
    return (
        <MainLayout>
            <Container sx={{ margin: '0 auto', padding: '20px' }}>{children}</Container>
        </MainLayout>
    );
}
