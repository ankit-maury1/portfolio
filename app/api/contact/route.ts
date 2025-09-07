import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllContactMessages, createContactMessage } from '@/lib/contact-messages';

// GET - Fetch all contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await getAllContactMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Submit a new contact message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate message length
    if (message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters long' }, { status: 400 });
    }

    // Create contact message
    const contactMessage = await createContactMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    if (!contactMessage) {
      return NextResponse.json({ error: 'Failed to create contact message' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Contact message submitted successfully',
      id: contactMessage._id
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
