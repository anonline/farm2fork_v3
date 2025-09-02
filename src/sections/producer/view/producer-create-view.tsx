'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ProducerNewEditForm from '../producer-new-edit-form';

export default function ProducerCreateView() {
    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Új termelő"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Termelők', href: paths.dashboard.producer.root },
                    { name: 'Új termelő' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />
            <ProducerNewEditForm />
        </DashboardContent>
    );
}
