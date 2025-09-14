import { Box, Button, Stack } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';



export default function ShipmentsView() {
    return (
        <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <CustomBreadcrumbs
                    heading="Összesítők"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Összesítők' },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            href={'#'}
                            variant="contained"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Új egyedi összesítő
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />
        </DashboardContent>
    );
}