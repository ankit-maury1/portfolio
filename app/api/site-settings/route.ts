import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllSettings, getSettingByKey } from '@/lib/site-settings';

// GET - Fetch all site settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // Get specific setting
      const setting = await getSettingByKey(key);
      
      if (!setting) {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
      }
      
      return NextResponse.json(setting);
    } else {
      // Get all settings
      const settings = await getAllSettings();
      
      return NextResponse.json(settings);
    }
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new site setting
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    // Check if setting already exists
    const existingSetting = await getSettingByKey(key);
    if (existingSetting) {
      return NextResponse.json(
        { error: 'Setting with this key already exists. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Import here to avoid circular dependency
    const { updateSetting } = await import('@/lib/site-settings');
    const setting = await updateSetting(key, value);

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error creating site setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update or create a site setting
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    // Import here to avoid circular dependency
    const { updateSetting } = await import('@/lib/site-settings');
    const setting = await updateSetting(key, value);
    
    // Track this setting update as an activity for better logging
    try {
      const { insertActivity } = await import('@/lib/activity-tracking');
      await insertActivity({
        type: 'profile',
        title: `Updated setting: ${key}`,
        description: `Updated site setting with key ${key}`,
        action: 'update',
        timestamp: new Date(),
        details: `New value: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value}`,
        user: session.user.name || 'Admin'
      });
    } catch (err) {
      console.error('Failed to log setting update activity:', err);
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error updating site setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a site setting
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    // Import here to avoid circular dependency
    const { deleteSetting } = await import('@/lib/site-settings');
    const result = await deleteSetting(key);

    return NextResponse.json({ success: true, deleted: key });
  } catch (error) {
    console.error('Error deleting site setting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
