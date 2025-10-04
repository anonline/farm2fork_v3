import type { SWRConfiguration } from 'swr';
import type EmailTemplate from 'src/types/emails/email-template';
import type { EmailTrigger } from 'src/types/emails/email-trigger';

import useSWR from 'swr';
import { useMemo } from 'react';

import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

// Client-side hook to get all email templates
export function useGetEmailTemplates() {
    const { data, isLoading, error, isValidating, mutate } = useSWR(
        'email-templates', 
        async () => {
            const { data: templates, error: fetchError } = await supabase
                .from('EmailTemplates')
                .select('*')
                .order('type', { ascending: true });
            
            if (fetchError) throw fetchError;
            return templates as EmailTemplate[];
        },
        swrOptions
    );

    const memoizedValue = useMemo(() => ({
        templates: data || [],
        templatesLoading: isLoading,
        templatesError: error,
        templatesValidating: isValidating,
        templatesEmpty: !isLoading && !data?.length,
        refreshTemplates: mutate,
    }), [data, error, isLoading, isValidating, mutate]);

    return memoizedValue;
}

// Client-side hook to get single email template
export function useGetEmailTemplate(type: EmailTrigger | null) {
    const { data, isLoading, error, isValidating, mutate } = useSWR(
        type ? `email-template-${type}` : null,
        async () => {
            if (!type) return null;
            
            const { data: template, error: fetchError } = await supabase
                .from('EmailTemplates')
                .select('*')
                .eq('type', type)
                .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
            return template as EmailTemplate | null;
        },
        swrOptions
    );

    const memoizedValue = useMemo(() => ({
        template: data || null,
        templateLoading: isLoading,
        templateError: error,
        templateValidating: isValidating,
        refreshTemplate: mutate,
    }), [data, error, isLoading, isValidating, mutate]);

    return memoizedValue;
}

// Client-side functions for template management
export async function createEmailTemplate(templateData: {
    type: EmailTrigger;
    subject: string;
    body: string;
    header: string;
    enabled: boolean;
}) {
    const { data, error } = await supabase
        .from('EmailTemplates')
        .insert({
            type: templateData.type,
            subject: templateData.subject,
            body: templateData.body,
            header: templateData.header,
            enabled: templateData.enabled,
        })
        .select()
        .single();

    if (error) throw error;
    return data as EmailTemplate;
}

export async function updateEmailTemplate(templateData: {
    type: EmailTrigger;
    subject: string;
    body: string;
    header: string;
    enabled: boolean;
}) {
    const { data, error } = await supabase
        .from('EmailTemplates')
        .upsert({
            type: templateData.type,
            subject: templateData.subject,
            header: templateData.header,
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
}

export async function deleteEmailTemplate(type: EmailTrigger) {
    const { error } = await supabase
        .from('EmailTemplates')
        .delete()
        .eq('type', type);

    if (error) throw error;
    return true;
}

export async function toggleEmailTemplateStatus(type: EmailTrigger, enabled: boolean) {
    const { data, error } = await supabase
        .from('EmailTemplates')
        .update({ 
            enabled, 
            updated_at: new Date().toISOString() 
        })
        .eq('type', type)
        .select()
        .single();

    if (error) throw error;
    return data as EmailTemplate;
}