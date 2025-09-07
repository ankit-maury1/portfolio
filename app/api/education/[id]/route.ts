import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ObjectId } from 'mongodb';
import { findById, getDatabase } from '@/lib/mongodb-helpers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const education = await findById('Education', params.id);

    if (!education) {
      return NextResponse.json({ error: 'Education record not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...education,
      id: education._id.toString(),
      _id: undefined
    });
  } catch (error) {
    console.error('Error fetching education record:', error);
    return NextResponse.json({ error: 'Failed to fetch education record' }, { status: 500 });
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

    const db = await getDatabase();
    
    const updateData = {
      institution,
      degree,
      field,
      location,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : null,
      current,
      logo,
      order,
      updatedAt: new Date()
    };

    const result = await db.collection('Education').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Education record not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...result,
      id: result._id.toString(),
      _id: undefined
    });
  } catch (error) {
    console.error('Error updating education record:', error);
    return NextResponse.json({ error: 'Failed to update education record' }, { status: 500 });
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
    const result = await db.collection('Education').deleteOne({
      _id: new ObjectId(params.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Education record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting education record:', error);
    return NextResponse.json({ error: 'Failed to delete education record' }, { status: 500 });
  }
}
