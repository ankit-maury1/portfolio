import { NextResponse } from 'next/server';
import { insertOne, findOne } from '../../../lib/mongodb-helpers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').toString().trim().toLowerCase();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Prevent duplicate subscriptions
    const existing = await findOne('NewsletterSubscribers', { email });
    if (existing) {
      return NextResponse.json({ ok: true, message: 'Already subscribed' });
    }

    const doc = {
      email,
      createdAt: new Date(),
      optedIn: true,
    };

    await insertOne('NewsletterSubscribers', doc);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error('Newsletter POST error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
