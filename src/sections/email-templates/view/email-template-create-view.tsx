'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EmailTemplateNewEditForm } from '../email-template-new-edit-form';

// ----------------------------------------------------------------------

export function EmailTemplateCreateView() {
    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="New Email Template"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Email Templates', href: paths.dashboard.emailtemplates.root },
                    { name: 'New Template' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <EmailTemplateNewEditForm />
        </DashboardContent>
    );
}