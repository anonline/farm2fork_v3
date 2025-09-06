'use client';

import { useParams } from 'next/navigation';

import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

import { useGetDelivery } from 'src/actions/delivery';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import DeliveryNewEditForm from 'src/sections/delivery/delivery-new-edit-form';

// ----------------------------------------------------------------------

export default function Page() {
    const params = useParams();
    const id = params.id as string;

    const { delivery, deliveryLoading } = useGetDelivery(id);

    return (
        <Container>
            <CustomBreadcrumbs
                heading="Futár szerkesztése"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Futárok', href: paths.dashboard.delivery.root },
                    { name: delivery?.name || '...' },
                ]}
            />
            {deliveryLoading && <CircularProgress />}
            {delivery && <DeliveryNewEditForm currentDelivery={delivery} />}
        </Container>
    );
}
