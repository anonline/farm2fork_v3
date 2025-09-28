import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { CONFIG } from 'src/global-config';
import { getEmailTemplateByTypeSSR } from 'src/actions/email-ssr';

import { EmailTemplateEditView } from 'src/sections/email-templates/view';

import { EmailTrigger } from 'src/types/emails/email-trigger';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Email sablon szerkesztése | Dashboard - ${CONFIG.appName}` };

type Props = {
    params: Promise<{ type: string }>;
};

export default async function Page({ params }: Readonly<Props>) {
    const { type } = await params;
    
    // Validate that the type is a valid EmailTrigger
    if (!Object.values(EmailTrigger).includes(type as EmailTrigger)) {
        notFound();
    }

    const template = await getEmailTemplateByTypeSSR(type as EmailTrigger);
    
    return <EmailTemplateEditView template={template || undefined} />;
}
