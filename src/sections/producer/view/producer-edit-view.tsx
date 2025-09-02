'use client';

import { useParams } from 'next/navigation';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { useGetProducerBySlug } from 'src/actions/producer';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ProducerNewEditForm from '../producer-new-edit-form';

export default function ProducerEditView() {
    const params = useParams();
    const slug = params.slug as string;

    const { producer, producerLoading } = useGetProducerBySlug(slug);

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Termelő szerkesztése"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Termelők', href: paths.dashboard.producer.root },
                    { name: producer?.name || '...' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            {!producerLoading && producer && <ProducerNewEditForm currentProducer={producer} />}
        </DashboardContent>
    );
}
