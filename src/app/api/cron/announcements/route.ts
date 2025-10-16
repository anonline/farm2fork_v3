import type { NextRequest } from 'next/server';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { fDate } from 'src/utils/format-time';

import { supabaseSSRCron } from 'src/lib/supabase-ssr';
import { getValidityDates, getNextAnnouncementText } from 'src/lib/announcement-helpers';

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const supabase = await supabaseSSRCron(cookieStore);

    try {
        // Verify the request is from Vercel Cron (optional but recommended)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            await supabase.from('cron_log').insert([{
                type: 'cron_announcements',
                comment: 'Authorization error',
                created_at: new Date(),
            }]);
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
            await supabase.from('cron_log').insert([{
                type: 'cron_announcements',
                comment: JSON.stringify(fetchError),
                created_at: new Date(),
            }]);
            return NextResponse.json(
                { error: 'Failed to fetch announcements', details: fetchError.message },
                { status: 500 }
            );
        }

        // If there are valid announcements, don't create a new one
        if (existingAnnouncements && existingAnnouncements.length > 0) {
            console.log('Valid announcement already exists:', existingAnnouncements[0]);

            await supabase.from('cron_log').insert([{
                type: 'cron_announcements',
                comment: 'Valid announcement already exists: ' + existingAnnouncements[0].id,
                created_at: new Date(),
            }]);

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

            await supabase.from('cron_log').insert([{
                type: 'cron_announcements',
                comment: JSON.stringify(createError),
                created_at: new Date(),
            }]);

            return NextResponse.json(
                { error: 'Failed to create announcement', details: createError.message },
                { status: 500 }
            );
        }

        console.log('New announcement created:', createdAnnouncement);

        await supabase.from('cron_log').insert([{
            type: 'cron_announcements',
            comment: JSON.stringify(createdAnnouncement),
            created_at: new Date(),
        }]);

        return NextResponse.json({
            message: 'New announcement created successfully',
            announcement: createdAnnouncement
        });

    } catch (error) {
        console.error('Unexpected error in cron job:', error);

        await supabase.from('cron_log').insert([{
            type: 'cron_announcements',
            comment: JSON.stringify(error),
            created_at: new Date(),
        }]);

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
