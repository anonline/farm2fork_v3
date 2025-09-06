import type { Metadata } from 'next';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import DeliveryNewEditForm from 'src/sections/delivery/delivery-new-edit-form';

export const metadata: Metadata = { title: 'Új futár' };

export default function Page() {
    return (
        <Container>
            <CustomBreadcrumbs
                heading="Új futár létrehozása"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Futárok', href: paths.dashboard.delivery.root },
                    { name: 'Új futár' },
                ]}
            />
            <DeliveryNewEditForm />
        </Container>
    );
}
