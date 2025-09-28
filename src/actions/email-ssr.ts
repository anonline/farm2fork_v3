'use server';

import type { IUserItem } from "src/types/user";
import type EmailTemplate from "src/types/emails/email-template";
import { EmailTrigger } from "src/types/emails/email-trigger";

import { cookies } from "next/headers";

import resendClient from "src/lib/resend";
import { supabaseSSR } from "src/lib/supabase-ssr";

import EmailBaseTemplate from "src/types/emails/email-base-template";

export async function triggerEmail(type: EmailTrigger, to: IUserItem){
    const template = await getEmailTemplateSSR(type);
    if(!template) throw new Error('No email template found for type ' + type);
    if(!template.enabled) {
        console.log(`Email template ${type} is disabled, skipping send`);
        return { success: true, skipped: true };
    }

    const email = new EmailBaseTemplate();
    email.setSubject(template.subject);
    email.setBody(template.body.replace('{{name}}', to.name || to.email));

    // Send email using Resend
    const result = await resendClient.sendEmailTemplate({
        to: to.email,
        from: process.env.FROM_EMAIL || 'noreply@farm2fork.com',
        subject: email.subject,
        template: email
    });

    if (!result.success) {
        throw new Error(`Failed to send email: ${result.error}`);
    }

    return result;
}

// Test email function - sends email using current template data without requiring database lookup
export async function triggerEmailTest(type: EmailTrigger, to: Partial<IUserItem>, templateData?: { subject: string; body: string }) {
    try {
        console.log('triggerEmailTest called with:', { type, to, templateData });
        
        let template;
        
        if (templateData) {
            // Use provided template data (for testing unsaved changes)
            template = {
                type,
                subject: templateData.subject,
                body: templateData.body,
                enabled: true,
            };
            console.log('Using provided template data:', template);
        } else {
            // Get template from database
            template = await getEmailTemplateSSR(type);
            if (!template) throw new Error('No email template found for type ' + type);
            if (!template.enabled) {
                throw new Error('Email template is disabled');
            }
            console.log('Using database template:', template);
        }

        const email = new EmailBaseTemplate();
        email.setSubject(template.subject);
        email.setBody(template.body.replace('{{name}}', to.name || to.email || 'Felhasználó'));

        // Send email using Resend
        const result = await resendClient.sendEmailTemplate({
            to: to.email || 'felhasznalo@pelda.hu',
            from: process.env.FROM_EMAIL || 'noreply@farm2fork.hu',
            subject: email.subject,
            template: email
        });

        console.log('Email send result:', result);

        if (!result.success) {
            throw new Error(`Failed to send test email: ${result.error}`);
        }

        return result;
    } catch (error) {
        console.error('triggerEmailTest error:', error);
        throw error;
    }
}

export async function triggerOrderPlacedEmail(to:string, name:string, orderId: string, expectedDeliveryDate?: string) {
    const template = await getEmailTemplateSSR(EmailTrigger.ORDER_PLACED);
    if(!template) throw new Error('No email template found for ORDER_PLACED');
    if(!template.enabled) {
        console.log('ORDER_PLACED email template is disabled, skipping send');
        return { success: true, skipped: true };
    }

    const email = new EmailBaseTemplate();
    email.setSubject(template.subject);
    email.setBody(template.body
        .replace('{{name}}', name || to)
        .replace('{{order_id}}', orderId)
        .replace('{{expected_delivery_section}}', `${expectedDeliveryDate || '' ? `<span style="text-align: center;padding: 12px;background: #cecece;font-weight: 600;border-radius: 8px;width: 100%;display: inline-block;">Várható kézbesítés: ${expectedDeliveryDate}</span>` : ''}`)

        );
    // Send email using Resend
    const result = await resendClient.sendEmailTemplate({
        to: to,
        from: process.env.FROM_EMAIL || 'Farm2Fork webshop <noreply@farm2fork.com>',
        subject: email.subject,
        template: email
    });

    if (!result.success) {
        throw new Error(`Failed to send email: ${result.error}`);
    }

    return result;
}

// Server-side function to get email template
async function getEmailTemplateSSR(type: EmailTrigger){
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);
        const { data, error } = await supabase.from('EmailTemplates')
            .select('*')
            .eq('type', type)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
        return data as EmailTemplate | null;
    } catch (error) {
        console.error('Error fetching email template:', error);
        return null;
    }
}

// Get all email templates
export async function getAllEmailTemplatesSSR() {
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);
        const { data, error } = await supabase.from('EmailTemplates')
            .select('*')
            .order('type', { ascending: true });

        if (error) throw error;
        return data as EmailTemplate[];
    } catch (error) {
        console.error('Error fetching email templates:', error);
        throw new Error('Failed to fetch email templates');
    }
}

// Get single email template by type
export async function getEmailTemplateByTypeSSR(type: EmailTrigger){
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);
        const { data, error } = await supabase.from('EmailTemplates')
            .select('*')
            .eq('type', type)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
        return data as EmailTemplate | null;
    } catch (error) {
        console.error('Error fetching email template:', error);
        return null;
    }
}

// Create or update email template
export async function upsertEmailTemplateSSR(templateData: {
    type: EmailTrigger;
    subject: string;
    body: string;
    enabled: boolean;
}) {
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);
        
        const { data, error } = await supabase.from('EmailTemplates')
            .upsert({
                type: templateData.type,
                subject: templateData.subject,
                body: templateData.body,
                enabled: templateData.enabled,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'type'
            })
            .select()
            .single();

        if (error) throw error;
        return data as EmailTemplate;
    } catch (error) {
        console.error('Error saving email template:', error);
        throw new Error('Failed to save email template');
    }
}

// Delete email template
export async function deleteEmailTemplateSSR(type: EmailTrigger) {
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);
        
        const { error } = await supabase.from('EmailTemplates')
            .delete()
            .eq('type', type);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting email template:', error);
        throw new Error('Failed to delete email template');
    }
}

// Toggle email template enabled status
export async function toggleEmailTemplateStatusSSR(type: EmailTrigger, enabled: boolean) {
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);
        
        const { data, error } = await supabase.from('EmailTemplates')
            .update({ 
                enabled, 
                updated_at: new Date().toISOString() 
            })
            .eq('type', type)
            .select()
            .single();

        if (error) throw error;
        return data as EmailTemplate;
    } catch (error) {
        console.error('Error toggling email template status:', error);
        throw new Error('Failed to update email template status');
    }
}