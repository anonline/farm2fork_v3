'use client';

import { useParams } from 'next/navigation';

import { Button } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

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
                action={
                    <>
                        {producer && (<Button
                            component={RouterLink}
                            href={paths.producers.details(producer.slug)}
                            variant="contained"
                            color='primary'
                            target="_blank"
                        >
                            Megnyitás
                        </Button>)}
                    </>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            {!producerLoading && producer && <ProducerNewEditForm currentProducer={producer} />}
        </DashboardContent>
    );
}
