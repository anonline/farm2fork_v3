import type { IAnnouncement, IAnnouncementCreate } from 'src/types/announcement';

import { createClient } from '@supabase/supabase-js';

import { fDate } from 'src/utils/format-time';

import { supabase } from 'src/lib/supabase';
import { getNextAnnouncementText, getValidityDates } from 'src/lib/announcement-helpers';

/**
 * Get all valid announcements for the current date/time
 */
export async function getValidAnnouncements(): Promise<IAnnouncement[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('Announcement')
        .select('*')
        .or(`validFrom.is.null,validFrom.lte.${now}`)
        .or(`validUntil.is.null,validUntil.gte.${now}`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching valid announcements:', error);
        throw new Error(error.message);
    }

    return data || [];
}

async function getNextAnnouncement() {
    return getNextAnnouncementText(supabase, fDate);
}

/**
 * Check for valid announcements and generate one if none exist (same logic as cron)
 */
export async function ensureValidAnnouncement(): Promise<IAnnouncement | null> {
    try {
        // Use service role key for admin operations (if available)
        const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
            ? createClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
              )
            : supabase;

        // Get current time
        const now = new Date().toISOString();

        // Check if there are any valid announcements
        const { data: existingAnnouncements, error: fetchError } = await supabaseAdmin
            .from('Announcement')
            .select('id, created_at, text, text_en, validFrom, validUntil')
            .or(`validFrom.is.null,validFrom.lte.${now}`)
            .or(`validUntil.is.null,validUntil.gte.${now}`)
            .order('created_at', { ascending: false })
            .limit(1);

        if (fetchError) {
            console.error('Error fetching announcements:', fetchError);
            return null;
        }

        // If there are valid announcements, return the first one
        if (existingAnnouncements && existingAnnouncements.length > 0) {
            console.log('Valid announcement already exists:', existingAnnouncements[0]);
            return existingAnnouncements[0] as IAnnouncement;
        }

        // No valid announcements found, create a new one
        console.log('No valid announcements found, creating new one...');

        const nextAnnouncement = await getNextAnnouncement();
        const validityDates = getValidityDates();

        const newAnnouncement = {
            ...nextAnnouncement,
            ...validityDates,
        };

        const { data: createdAnnouncement, error: createError } = await supabaseAdmin
            .from('Announcement')
            .insert([newAnnouncement])
            .select()
            .single();

        if (createError) {
            console.error('Error creating announcement:', createError);
            return null;
        }

        console.log('New announcement created:', createdAnnouncement);
        return createdAnnouncement;
    } catch (error) {
        console.error('Unexpected error in ensureValidAnnouncement:', error);
        return null;
    }
}

/**
 * Get the most recent valid announcement
 */
export async function getCurrentAnnouncement(): Promise<IAnnouncement | null> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from('Announcement')
        .select('*')
        .or(`validFrom.is.null,validFrom.lte.${now}`)
        .or(`validUntil.is.null,validUntil.gte.${now}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('Error fetching current announcement:', error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(
    announcement: IAnnouncementCreate
): Promise<IAnnouncement> {
    const { data, error } = await supabase
        .from('Announcement')
        .insert([announcement])
        .select()
        .single();

    if (error) {
        console.error('Error creating announcement:', error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(
    id: number,
    updates: Partial<IAnnouncementCreate>
): Promise<IAnnouncement> {
    const { data, error } = await supabase
        .from('Announcement')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating announcement:', error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: number): Promise<void> {
    const { error } = await supabase.from('Announcement').delete().eq('id', id);

    if (error) {
        console.error('Error deleting announcement:', error);
        throw new Error(error.message);
    }
}

/**
 * Get all announcements (for admin purposes)
 */
export async function getAllAnnouncements(): Promise<IAnnouncement[]> {
    const { data, error } = await supabase
        .from('Announcement')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all announcements:', error);
        throw new Error(error.message);
    }

    return data || [];
}
