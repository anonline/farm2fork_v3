import { EmailTrigger } from "./email-trigger";

export default interface EmailTemplate {
    id: number;
    enabled: boolean;
    type: EmailTrigger;
    subject: string;
    body: string;
    created_at: string;
    updated_at: string;
}