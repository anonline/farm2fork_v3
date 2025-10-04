'use server';

import type { IUserItem } from 'src/types/user';
import type EmailTemplate from 'src/types/emails/email-template';

import { cookies } from 'next/headers';

import resendClient from 'src/lib/resend';
import { supabaseSSR } from 'src/lib/supabase-ssr';

import { EmailTrigger } from 'src/types/emails/email-trigger';
import EmailBaseTemplate from 'src/types/emails/email-base-template';

import { IOrderData } from 'src/types/order-management';
import { getOrderByIdSSR } from './order-ssr';

import { getDelivery } from './delivery-ssr';

export async function triggerEmail(type: EmailTrigger, to: IUserItem) {
    const template = await getEmailTemplateSSR(type);
    if (!template) throw new Error('No email template found for type ' + type);
    if (!template.enabled) {
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
        template: email,
    });

    if (!result.success) {
        throw new Error(`Failed to send email: ${result.error}`);
    }

    return result;
}

// Test email function - sends email using current template data without requiring database lookup
export async function triggerEmailTest(
    type: EmailTrigger,
    to: Partial<IUserItem>,
    templateData?: { subject: string; body: string },
    orderId?: string
) {
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
            template: email,
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



export async function triggerOrderPlacedEmail(
    to: string,
    name: string,
    orderId: string,
    expectedDeliveryDate?: string
) {
    const template = await getEmailTemplateSSR(EmailTrigger.ORDER_PLACED);

    const { order } = await getOrderByIdSSR(orderId);

    let futar = await getDelivery(order?.courier || '');

    if (!template) throw new Error('No email template found for ORDER_PLACED');
    if (!template.enabled) {
        console.log('ORDER_PLACED email template is disabled, skipping send');
        return { success: true, skipped: true };
    }

    const email = new EmailBaseTemplate();
    template.subject = replaceName(template.subject, name || to);
    template.subject = replaceOrderId(template.subject, orderId);

    email.setSubject(template.subject);

    email.setHeader(template.header || '');

    template.body = replaceName(template.body, name || to);
    template.body = replaceOrderId(template.body, orderId);
    template.body = replaceExpectedDelivery(template.body, expectedDeliveryDate ?? '', order?.shipment_time);
    template.body = replaceOrderDetailsTable(template.body, order!);
    template.body = replaceChangeLog(template.body, order?.history_for_user || '');
    template.body = replaceFutarInfo(template.body, {name: futar?.name || '', phone: futar?.phone || ''});


    email.setBody(template.body);

    // Send email using Resend
    const result = await resendClient.sendEmailTemplate({
        to,
        from: process.env.FROM_EMAIL || 'Farm2Fork webshop <noreply@farm2fork.com>',
        subject: email.subject,
        template: email,
    });

    if (!result.success) {
        throw new Error(`Failed to send email: ${result.error}`);
    }

    return result;
}

export async function triggerOrderPlacedAdminEmail(
    to: string,
    name: string,
    orderId: string,
    expectedDeliveryDate?: string
) {
    const template = await getEmailTemplateSSR(EmailTrigger.ORDER_PLACED_ADMIN);

    const { order } = await getOrderByIdSSR(orderId);

    let futar = await getDelivery(order?.courier || '');

    if (!template) throw new Error('No email template found for ORDER_PLACED_ADMIN');
    if (!template.enabled) {
        console.log('ORDER_PLACED_ADMIN email template is disabled, skipping send');
        return { success: true, skipped: true };
    }

    const email = new EmailBaseTemplate();
    template.subject = replaceName(template.subject, name || to);
    template.subject = replaceOrderId(template.subject, orderId);

    email.setSubject(template.subject);

    email.setHeader(template.header || '');

    template.body = replaceName(template.body, name || to);
    template.body = replaceOrderId(template.body, orderId);
    template.body = replaceExpectedDelivery(template.body, expectedDeliveryDate ?? '', order?.shipment_time);
    template.body = replaceOrderDetailsTable(template.body, order!);
    template.body = replaceChangeLog(template.body, order?.history_for_user || '');
    template.body = replaceFutarInfo(template.body, {name: futar?.name || '', phone: futar?.phone || ''});


    email.setBody(template.body);

    // Send email using Resend
    const result = await resendClient.sendEmailTemplate({
        to,
        from: process.env.FROM_EMAIL || 'Farm2Fork webshop <noreply@farm2fork.com>',
        subject: email.subject,
        template: email,
    });

    if (!result.success) {
        throw new Error(`Failed to send email: ${result.error}`);
    }

    return result;
}

export async function triggerOrderProcessedEmail(
    to: string,
    name: string,
    orderId: string,
    expectedDeliveryDate?: string
) {
    const template = await getEmailTemplateSSR(EmailTrigger.ORDER_PROCESSED);

    const { order } = await getOrderByIdSSR(orderId);

    let futar = await getDelivery(order?.courier || '');

    if (!template) throw new Error('No email template found for ORDER_PLACED_ADMIN');
    if (!template.enabled) {
        console.log('ORDER_PLACED_ADMIN email template is disabled, skipping send');
        return { success: true, skipped: true };
    }

    const email = new EmailBaseTemplate();
    template.subject = replaceName(template.subject, name || to);
    template.subject = replaceOrderId(template.subject, orderId);

    email.setSubject(template.subject);

    email.setHeader(template.header || '');

    template.body = replaceName(template.body, name || to);
    template.body = replaceOrderId(template.body, orderId);
    template.body = replaceExpectedDelivery(template.body, expectedDeliveryDate ?? '', order?.shipment_time);
    template.body = replaceOrderDetailsTable(template.body, order!);
    template.body = replaceChangeLog(template.body, order?.history_for_user || '');
    template.body = replaceFutarInfo(template.body, {name: futar?.name || '', phone: futar?.phone || ''});


    email.setBody(template.body);

    // Send email using Resend
    const result = await resendClient.sendEmailTemplate({
        to,
        from: process.env.FROM_EMAIL || 'Farm2Fork webshop <noreply@farm2fork.com>',
        subject: email.subject,
        template: email,
    });

    if (!result.success) {
        throw new Error(`Failed to send email: ${result.error}`);
    }

    return result;
}

// Server-side function to get email template
async function getEmailTemplateSSR(type: EmailTrigger) {
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);
        const { data, error } = await supabase
            .from('EmailTemplates')
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
        const { data, error } = await supabase
            .from('EmailTemplates')
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
export async function getEmailTemplateByTypeSSR(type: EmailTrigger) {
    try {
        const cookieStore = await cookies();
        const supabase = await supabaseSSR(cookieStore);
        const { data, error } = await supabase
            .from('EmailTemplates')
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

        const { data, error } = await supabase
            .from('EmailTemplates')
            .upsert(
                {
                    type: templateData.type,
                    subject: templateData.subject,
                    body: templateData.body,
                    enabled: templateData.enabled,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: 'type',
                }
            )
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

        const { error } = await supabase.from('EmailTemplates').delete().eq('type', type);

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

        const { data, error } = await supabase
            .from('EmailTemplates')
            .update({
                enabled,
                updated_at: new Date().toISOString(),
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

function replaceName(body: string, name: string) {
    return body.replaceAll('{{name}}', name);
}

function replaceOrderId(body: string, orderId: string) {
    return body.replaceAll('{{order_id}}', orderId);
}

function replaceExpectedDelivery(body: string, expectedDelivery: string, expectedTime?: string) {
    const text = `<span style="text-align: center;padding: 12px;background: #cecece;font-weight: 600;border-radius: 8px;width: 100%;display: inline-block;">Várható kézbesítés: ${expectedDelivery}${expectedTime ? ` (${expectedTime})` : ''}</span>`;
    return body.replaceAll('{{expected_delivery_section}}', text);
}

function replaceChangeLog(body: string, changeLog: string) {
    console.log('Change log:', changeLog);
    // Replace newlines with <br /> tags for HTML email display
    changeLog = changeLog.replace(/\n/g, '<br />');
    const text = changeLog.trim() ? `<p style="padding: 12px;background: #cecece;border-radius: 8px;width: 100%;display: inline-block;"><span style="font-weight: 600;">Pár tételt módosítanunk kellett a rendelésedben:</span><br />${changeLog}</p>` : '';
    return body.replaceAll('{{change_log_section}}', text);
}

function replaceFutarInfo(body: string, futarInfo: {name:string, phone:string}) {
    if(!futarInfo.name && !futarInfo.phone) return body.replaceAll('{{futar_info}}', '');

    const text = `<span style="text-align: center;padding: 12px;background: #cecece;font-weight: 600;border-radius: 8px;width: 100%;display: inline-block;">Futár elérhetősége: ${futarInfo.name} (<a href="tel:+${futarInfo.phone}">+${futarInfo.phone}</a>)</span>`;
    return body.replaceAll('{{futar_info}}', text);
}

function replaceOrderDetailsTable(body: string, orderData: IOrderData) {
    let orderDetailsTableHTML = ``;
    let grossSubtotal = orderData.items.reduce((acc, item) => acc + item.subtotal, 0);

    orderDetailsTableHTML += `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                    <th>Termék</th>
                    <th style="text-align: center;border-left: 1px solid #ddd;border-right: 1px solid #ddd;">Mennyiség</th>
                    <th style="text-align: right;">Ár</th>
                </tr>`;
    for (const item of orderData.items) {
        orderDetailsTableHTML += `
            <tr style="border-top: 1px solid #ddd;">
                <td>${item.name}${item.note ? `<br/><span style="font-size: 0.8rem; color: #888;">${item.note}</span>` : ''}</td>
                <td style="text-align: center;border-left: 1px solid #ddd;border-right: 1px solid #ddd;">${item.quantity} ${item.unit || 'db'}</td>
                <td style="text-align: right;">${formatNumber(item.subtotal)} Ft</td>
            </tr>
        `;
    }

    orderDetailsTableHTML += `
        <tr style="border-top: 2px solid #ddd;">
            <td colspan="2">Részösszeg:</td>
            <td style="text-align: right;">${formatNumber(grossSubtotal)} Ft</td>
        </tr>
        <tr style="border-top: 1px solid #ddd;">
            <td>Szállítás:</td>
            <td style="text-align: center;border-left: 1px solid #ddd;border-right: 1px solid #ddd;">${orderData.shippingMethod?.name}</td>
            <td style="text-align: right;">${formatNumber(orderData.shippingCost)} Ft</td>
        </tr>
        <tr style="border-top: 1px solid #ddd;">
            <td colspan="2">ÁFA:</td>
            <td style="text-align: right;">${formatNumber(Math.round(orderData.vatTotal))} Ft</td>
        </tr>
        <tr style="font-weight: 600; border-top: 1px solid #ddd;">
            <td colspan="2">Végösszeg:</td>
            <td style="text-align: right;">${formatNumber(grossSubtotal + orderData.shippingCost)} Ft</td>
        </tr>

        <tr>
            <td colspan="2" style="padding-top: 12px; font-size: 0.8rem; color: #888;">
                Fizetési mód:
            </td>
            <td style="text-align: right; padding-top: 12px; font-size: 0.8rem; color: #888;">
                ${orderData.paymentMethod?.name || 'Ismeretlen'}
            </td>
        </tr>
        <tr>
            <td colspan="2" style="padding-top: 4px; font-size: 0.8rem; color: #888;">
                Rendelés dátuma:
            </td>
            <td style="text-align: right; padding-top: 4px; font-size: 0.8rem; color: #888;">
                ${new Date(orderData.dateCreated).getFullYear()}.${(new Date(orderData.dateCreated).getMonth() + 1)}.${new Date(orderData.dateCreated).getDate().toString().padStart(2, '0')} ${new Date(orderData.dateCreated).getHours().toString().padStart(2, '0')}:${String(new Date(orderData.dateCreated).getMinutes()).padStart(2, '0')}
            </td>
        </tr>
    `;
    orderDetailsTableHTML += `</table>`;

    //-------------------------
    orderDetailsTableHTML += `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr>
                <td colspan="2" style="padding-top: 12px; font-size: 0.8rem; color: #888;">
                <span style="font-weight: 600;">Szállítási cím:</span><br/>
                    ${orderData.shippingAddress?.name || 'Ismeretlen'} ${orderData.shippingAddress?.company ? ` - ${orderData.shippingAddress?.company}` : ''}<br/>
                    ${orderData.shippingAddress?.phone || orderData.shippingAddress?.phoneNumber ? `${orderData.shippingAddress?.phone || orderData.shippingAddress?.phoneNumber}<br />` : ''}
                    ${orderData.shippingAddress?.email ? `${orderData.shippingAddress?.email} <br />` : ''}
                    ${orderData.shippingAddress?.postcode || ''} ${orderData.shippingAddress?.city || ''} ${orderData.shippingAddress?.street || ''} ${orderData.shippingAddress?.houseNumber || ''} ${orderData.shippingAddress?.floor || ''} ${orderData.shippingAddress?.doorbell || ''}<br/>
                    ${orderData.shippingAddress?.note || ''}
                </td>
                <td colspan="2" style="padding-top: 12px; font-size: 0.8rem; color: #888; text-align: right;">
                    <span style="font-weight: 600;">Számlázási cím:</span><br/>
                    ${orderData.billingAddress?.name || 'Ismeretlen'} ${orderData.billingAddress?.company ? ` - ${orderData.billingAddress?.company}` : ''}<br/>
                    ${orderData.billingAddress?.taxNumber ? `${orderData.billingAddress?.taxNumber} <br />` : ''}
                    ${orderData.billingAddress?.phone || orderData.billingAddress?.phoneNumber ? `${orderData.billingAddress?.phone || orderData.billingAddress?.phoneNumber} <br />` : ''}
                    ${orderData.billingAddress?.email ? `${orderData.billingAddress?.email} <br />` : ''}
                    ${orderData.billingAddress?.postcode || ''} ${orderData.billingAddress?.city || ''} ${orderData.billingAddress?.street || ''} ${orderData.billingAddress?.houseNumber || ''} ${orderData.billingAddress?.floor || ''} ${orderData.billingAddress?.doorbell || ''}<br/>
                    ${orderData.billingAddress?.note || ''}
                </td>
            </tr>
        </table>
    `;

    return body.replaceAll('{{order_details_table}}', orderDetailsTableHTML);
}

const formatNumber = (num: string | number) =>
    String(num).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1 ');
