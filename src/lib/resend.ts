import type EmailBaseTemplate from 'src/types/emails/email-base-template';

import { Resend } from 'resend';

class ResendClient {
    private client: Resend;
    
    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('RESEND_API_KEY not found in environment variables');
        }
        this.client = new Resend(apiKey);
    }

    async sendEmail(params: {
        to: string | string[];
        from: string;
        subject: string;
        html: string;
        text?: string;
    }) {
        try {
            const result = await this.client.emails.send({
                from: params.from,
                to: params.to,
                subject: params.subject,
                html: params.html,
                text: params.text,
            });
            
            return { success: true, data: result };
        } catch (error) {
            console.error('Failed to send email:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    async sendEmailTemplate(params: {
        to: string | string[];
        from: string;
        subject: string;
        template: EmailBaseTemplate;
    }) {
        const html = params.template.generateHTML();

        return this.sendEmail({
            to: params.to,
            from: params.from,
            subject: params.subject,
            html,
        });
    }
}

const resendClient = new ResendClient();
export default resendClient;