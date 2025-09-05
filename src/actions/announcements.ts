import type { IAnnouncement, IAnnouncementCreate } from 'src/types/announcement';

import { supabase } from 'src/lib/supabase';

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
export async function createAnnouncement(announcement: IAnnouncementCreate): Promise<IAnnouncement> {
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
export async function updateAnnouncement(id: number, updates: Partial<IAnnouncementCreate>): Promise<IAnnouncement> {
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
  const { error } = await supabase
    .from('Announcement')
    .delete()
    .eq('id', id);

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
