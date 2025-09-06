import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

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

    const randomAnnouncement = getRandomAnnouncement();
    const validityDates = getValidityDates();

    const newAnnouncement = {
      ...randomAnnouncement,
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
