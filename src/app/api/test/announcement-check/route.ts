import { NextResponse } from 'next/server';

import { ensureValidAnnouncement } from 'src/actions/announcements';

export async function GET() {
  try {
    console.log('Test endpoint: Checking announcements...');
    
    const announcement = await ensureValidAnnouncement();
    
    if (announcement) {
      return NextResponse.json({
        success: true,
        message: 'Announcement check completed successfully',
        announcement: {
          id: announcement.id,
          text: announcement.text,
          text_en: announcement.text_en,
          validFrom: announcement.validFrom,
          validUntil: announcement.validUntil,
          created_at: announcement.created_at
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No announcement found or created'
      });
    }
  } catch (error) {
    console.error('Error in announcement check test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
