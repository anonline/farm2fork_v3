import { cookies } from "next/headers";
import { supabaseSSR } from "src/lib/supabase-ssr";
import EmailBaseTemplate from "src/types/emails/email-base-template";
import EmailTemplate from "src/types/emails/email-template";
import { EmailTrigger } from "src/types/emails/email-trigger";
import { IUserItem } from "src/types/user";

export async function triggerEmail(type: EmailTrigger, to: IUserItem){
    const template = await getEmailTemplate(type);
    if(!template) throw new Error('No email template found for type ' + type);

    const email = new EmailBaseTemplate();

    email.setSubject(template.subject);
    email.setBody(template.body.replace('{{name}}', to.name || to.email));
}

async function getEmailTemplate(type: EmailTrigger){
    const cookieStore = await cookies();
    const supabase = await supabaseSSR(cookieStore);
    const { data } = await supabase.from('EmailTemplates')
        .select('*')
        .eq('type', type)
        .single();

    return data as EmailTemplate | null;
}