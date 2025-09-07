"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfileEditor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({ name: '', title: '', summary: '', username: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
  }, [status, router]);

  useEffect(() => {
    async function load() {
      if (!session?.user?.id) return;
      setLoading(true);
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || {});
      } else {
        setError('Failed to load profile');
      }
      setLoading(false);
    }
    load();
  }, [session]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Failed to save');
    } else {
      // reload session/profile
      router.refresh();
    }
    setSaving(false);
  }

  if (status === 'loading' || loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit profile</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input className="w-full p-2 border" value={profile.name || ''} onChange={(e) => setProfile({...profile, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm">Username</label>
          <input className="w-full p-2 border" value={profile.username || ''} onChange={(e) => setProfile({...profile, username: e.target.value})} />
          <p className="text-xs text-gray-500">Public URL will be: {typeof window !== 'undefined' ? window.location.origin : ''}/{profile.username || 'your-username'}</p>
        </div>
        <div>
          <label className="block text-sm">Title</label>
          <input className="w-full p-2 border" value={profile.title || ''} onChange={(e) => setProfile({...profile, title: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm">Summary</label>
          <textarea className="w-full p-2 border" value={profile.summary || ''} onChange={(e) => setProfile({...profile, summary: e.target.value})} />
        </div>
        <div>
          <button className="px-4 py-2 bg-cyan-600 text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
