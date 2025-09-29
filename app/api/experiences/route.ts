import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { findMany, getDatabase, insertOne } from '@/lib/mongodb-helpers';
import { trackDetailedActivity } from '@/lib/activity-tracking';

export async function GET() {
  try {
    const experiences = await findMany('Experience', {}, { sort: { order: 1 } });
    
    return NextResponse.json(experiences.map(exp => ({
      ...exp,
      id: exp._id.toString(),
      _id: undefined
    })));
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
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

    const newExperience = {
      title,
      company,
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

    const result = await insertOne('Experience', newExperience);

    try {
      await trackDetailedActivity(
        'experience',
        `${title} - ${company}`,
        'create',
        `Added experience: ${title} at ${company}`,
        '/admin/experience',
        session.user.name || 'Admin'
      );
    } catch (err) {
      console.error('Failed to log experience create activity', err);
    }
    
    return NextResponse.json({
      ...newExperience,
      id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}
