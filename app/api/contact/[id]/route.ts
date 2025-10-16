import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getContactMessageById, markContactMessageAsRead, markContactMessageAsReplied, deleteContactMessage } from '@/lib/contact-messages';
// Activity logging now handled inside helper functions to avoid duplication

// GET - Get a specific contact message by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { id } = await params;
  const messageRaw = await getContactMessageById(id);
  const message = messageRaw && typeof messageRaw === 'object' ? (messageRaw as { _id?: string; id?: string; name: string; email: string; message: string; createdAt?: Date; read?: boolean; replied?: boolean }) : null;

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error fetching contact message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update contact message (mark as read/replied)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const { id } = await params;
  const body = await request.json();
  const { read: readFlag, replied: repliedFlag } = body as { read?: boolean; replied?: boolean };
    
    let success = false;
    
    // Update read status if provided
    if (typeof readFlag === 'boolean') {
      success = await markContactMessageAsRead(id, readFlag);
    }
    
    // Update replied status if provided
    if (typeof repliedFlag === 'boolean') {
      success = await markContactMessageAsReplied(id, repliedFlag);
    }
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }
    
    // Get updated message
    const message = await getContactMessageById(id);

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a contact message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteContactMessage(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Contact message deleted' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
