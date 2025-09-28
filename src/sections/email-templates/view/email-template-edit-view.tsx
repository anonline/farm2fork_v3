'use client';

import type EmailTemplate from 'src/types/emails/email-template';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { EmailTemplateNewEditForm } from '../email-template-new-edit-form';

// ----------------------------------------------------------------------

type Props = {
    template?: EmailTemplate;
};

export function EmailTemplateEditView({ template }: Props) {
    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Edit Email Template"
                backHref={paths.dashboard.emailtemplates.root}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Email Templates', href: paths.dashboard.emailtemplates.root },
                    { name: template?.type?.replace(/_/g, ' ') || 'Edit Template' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <EmailTemplateNewEditForm currentTemplate={template} />
        </DashboardContent>
    );
}