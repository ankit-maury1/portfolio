import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';
import { findById, getDatabase } from '@/lib/mongodb-helpers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const experience = await findById('Experience', params.id);

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
  { params }: { params: { id: string } }
) {
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
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...result,
      id: result._id.toString(),
      _id: undefined
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const result = await db.collection('Experience').deleteOne({ 
      _id: new ObjectId(params.id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}
