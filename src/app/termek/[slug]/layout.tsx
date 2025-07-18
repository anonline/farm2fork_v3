import { Container } from '@mui/material';

import { MainLayout } from 'src/layouts/main';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
    return (
    <MainLayout sx={{padding:'0px'}}>
        <Container maxWidth={false} sx={{margin: '0 auto', padding: '0px !important'}}>
            {children}
        </Container>
    </MainLayout>);
}
