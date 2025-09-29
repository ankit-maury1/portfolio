import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { findMany, insertOne } from '@/lib/mongodb-helpers';
import { trackDetailedActivity } from '@/lib/activity-tracking';

export async function GET() {
  try {
    const education = await findMany('Education', {}, { sort: { order: 1 } });
    
    return NextResponse.json(education.map(item => ({
      ...item,
      id: item._id.toString(),
      _id: undefined
    })));
  } catch (error) {
    console.error('Error fetching education records:', error);
    return NextResponse.json({ error: 'Failed to fetch education records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      institution,
      degree,
      field,
      location,
      description,
      startDate,
      endDate,
      current,
      logo,
      order,
    } = body;

    const newEducation = {
      institution,
      degree,
      field,
      location,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      current: current || false,
      logo,
      order: order || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await insertOne('Education', newEducation);

    try {
      await trackDetailedActivity(
        'education',
        `${degree} - ${institution}`,
        'create',
        `Added education: ${degree} at ${institution}`,
        '/admin/education',
        session.user.name || 'Admin'
      );
    } catch (err) {
      console.error('Failed to log education create activity', err);
    }
    
    return NextResponse.json({
      ...newEducation,
      id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error creating education record:', error);
    return NextResponse.json({ error: 'Failed to create education record' }, { status: 500 });
  }
}
