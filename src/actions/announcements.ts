import type { IAnnouncement, IAnnouncementCreate } from 'src/types/announcement';

import { createClient } from '@supabase/supabase-js';

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

// Array of possible announcement messages
const ANNOUNCEMENT_MESSAGES = [
  'Friss termékek érkeztek! Tekintse meg új kínálatunkat.',
  'Szezonális különlegességek most elérhető áron!',
  'Házhoz szállítás minden kedden és csütörtökön!',
  'Bio minősítésű termékek széles választéka várja!',
  'Előrendelhető szezonális csomagok 20% kedvezménnyel!',
  'Helyi termelőktől frissen: ma szedett gyümölcsök!',
  'Újdonság: vegán és gluténmentes termékpaletta!',
  'Fenntartható csomagolásban, környezetbarát módon!',
  'Családi gazdaságokból közvetlenül az asztalára!',
  'Minőségi termékek, fair áron, helyi termelőktől!'
];

const ANNOUNCEMENT_MESSAGES_EN = [
  'Fresh products have arrived! Check out our new selection.',
  'Seasonal specialties now available at great prices!',
  'Home delivery every Tuesday and Thursday!',
  'Wide selection of organic certified products awaits!',
  'Pre-order seasonal packages with 20% discount!',
  'Fresh from local producers: today\'s picked fruits!',
  'New: vegan and gluten-free product range!',
  'Sustainable packaging, environmentally friendly!',
  'From family farms directly to your table!',
  'Quality products, fair prices, from local producers!'
];

function getRandomAnnouncement() {
  const randomIndex = Math.floor(Math.random() * ANNOUNCEMENT_MESSAGES.length);
  return {
    text: ANNOUNCEMENT_MESSAGES[randomIndex],
    text_en: ANNOUNCEMENT_MESSAGES_EN[randomIndex]
  };
}

function getValidityDates() {
  const now = new Date();
  const validFrom = new Date(now);
  
  // Valid from today at 00:00
  validFrom.setHours(0, 0, 0, 0);
  
  // Valid until tomorrow at 23:59
  const validUntil = new Date(validFrom);
  validUntil.setDate(validUntil.getDate() + 1);
  validUntil.setHours(23, 59, 59, 999);
  
  return {
    validFrom: validFrom.toISOString().slice(0, 19), // Remove 'Z' for timestamp without time zone
    validUntil: validUntil.toISOString().slice(0, 19)
  };
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

    const randomAnnouncement = getRandomAnnouncement();
    const validityDates = getValidityDates();

    const newAnnouncement = {
      ...randomAnnouncement,
      ...validityDates
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
