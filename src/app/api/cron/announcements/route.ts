import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { fDate } from 'src/utils/format-time';

import { getNextAnnouncementText, getValidityDates } from 'src/lib/announcement-helpers';

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (optional but recommended)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Cron job started: Checking announcements...');

    // Get current time
    const now = new Date().toISOString();

    // Check if there are any valid announcements
    const { data: existingAnnouncements, error: fetchError } = await supabase
      .from('Announcement')
      .select('id, text, validFrom, validUntil')
      .or(`validFrom.is.null,validFrom.lte.${now}`)
      .or(`validUntil.is.null,validUntil.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching announcements:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch announcements', details: fetchError.message },
        { status: 500 }
      );
    }

    // If there are valid announcements, don't create a new one
    if (existingAnnouncements && existingAnnouncements.length > 0) {
      console.log('Valid announcement already exists:', existingAnnouncements[0]);
      return NextResponse.json({
        message: 'Valid announcement already exists',
        announcement: existingAnnouncements[0]
      });
    }

    // No valid announcements found, create a new one
    console.log('No valid announcements found, creating new one...');

    const nextAnnouncement = await getNextAnnouncementText(supabase, fDate);
    const validityDates = getValidityDates();

    const newAnnouncement = {
      ...nextAnnouncement,
      ...validityDates
    };

    const { data: createdAnnouncement, error: createError } = await supabase
      .from('Announcement')
      .insert([newAnnouncement])
      .select()
      .single();

    if (createError) {
      console.error('Error creating announcement:', createError);
      return NextResponse.json(
        { error: 'Failed to create announcement', details: createError.message },
        { status: 500 }
      );
    }

    console.log('New announcement created:', createdAnnouncement);

    return NextResponse.json({
      message: 'New announcement created successfully',
      announcement: createdAnnouncement
    });

  } catch (error) {
    console.error('Unexpected error in cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also allow POST for testing purposes
export async function POST(request: NextRequest) {
  return GET(request);
}
