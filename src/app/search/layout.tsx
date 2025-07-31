import { Box } from '@mui/material';

import { MainLayout } from 'src/layouts/main';

// ----------------------------------------------------------------------

type Props = {
    children: React.ReactNode;
};

export default function Layout({ children }: Readonly<Props>) {
    return (
    <MainLayout>
        <Box sx={{width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '20px'}}>
            {children}
        </Box>
    </MainLayout>);
}
