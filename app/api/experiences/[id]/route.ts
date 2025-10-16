import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';
import { findById, getDatabase } from '@/lib/mongodb-helpers';
import { trackDetailedActivity } from '@/lib/activity-tracking';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const experience = await findById('Experience', id);

    if (!experience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    // Convert ObjectId to string for the response
    return NextResponse.json({
      ...experience,
      id: experience._id.toString(),
      _id: undefined
    });
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json({ error: 'Failed to fetch experience' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const {
      title,
      company,
      location,
      description,
      startDate,
      endDate,
      current,
      logo,
      order,
    } = body;

    const db = await getDatabase();
    
    const updateData = {
      title,
      company,
      location,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : null,
      current,
      logo,
      order,
      updatedAt: new Date()
    };

    const result = await db.collection('Experience').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    const updated: { _id: ObjectId; [key: string]: unknown } = (result as { value?: { _id: ObjectId; [key: string]: unknown } })?.value || result as { _id: ObjectId; [key: string]: unknown };
    const responsePayload = {
      ...updated,
      id: updated._id.toString(),
      _id: undefined
    };

    try {
      await trackDetailedActivity(
        'experience',
        `${updated.title || title} - ${updated.company || company}`,
        'update',
        `Updated experience: ${updated.title || title} at ${updated.company || company}`,
        '/admin/experience',
        session.user.name || 'Admin'
      );
    } catch (err) {
      console.error('Failed to log experience update activity', err);
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDatabase();
    const existing = await db.collection('Experience').findOne({ _id: new ObjectId(id) });
    const result = await db.collection('Experience').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    try {
      if (existing) {
        await trackDetailedActivity(
          'experience',
          `${existing.title || 'Experience'} - ${existing.company || ''}`,
          'delete',
          `Deleted experience: ${existing.title} at ${existing.company}`,
          '/admin/experience',
          session.user.name || 'Admin'
        );
      }
    } catch (err) {
      console.error('Failed to log experience delete activity', err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}
