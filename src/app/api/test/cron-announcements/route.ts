import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

/**
 * Test endpoint to manually trigger the announcements cron job
 * This endpoint can be used for testing the cron functionality
 */
export async function GET(request: NextRequest) {
  try {
    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;
    
    // Call the actual cron endpoint
    const cronResponse = await fetch(`${baseUrl}/api/cron/announcements`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`,
      },
    });

    const cronData = await cronResponse.json();

    return NextResponse.json({
      message: 'Test cron job executed',
      status: cronResponse.status,
      result: cronData
    }, { status: cronResponse.status });

  } catch (error) {
    console.error('Error in test cron endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to execute test cron job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
