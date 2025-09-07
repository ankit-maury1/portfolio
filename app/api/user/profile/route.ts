'use server';

import { getDatabase } from '@/lib/mongodb-helpers';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().optional(),
  username: z.string().min(3).regex(/^[a-z0-9_-]+$/i).optional(),
  title: z.string().optional(),
  summary: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authConfig as any);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDatabase();
  const user = await db.collection('User').findOne({ _id: new (require('mongodb').ObjectId)(session.user.id) });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const profile = {
    name: user.name,
    username: user.username,
    title: user.title || '',
    summary: user.summary || ''
  };

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authConfig as any);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const db = await getDatabase();

  // If updating username, ensure uniqueness
  if (parsed.data.username) {
    const existing = await db.collection('User').findOne({ username: parsed.data.username });
    if (existing && existing._id.toString() !== session.user.id) {
      return NextResponse.json({ error: 'username already in use' }, { status: 409 });
    }
  }

  await db.collection('User').updateOne(
    { _id: new (require('mongodb').ObjectId)(session.user.id) },
    { $set: { ...parsed.data, updatedAt: new Date() } }
  );

  return NextResponse.json({ success: true });
}
