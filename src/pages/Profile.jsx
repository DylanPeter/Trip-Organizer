// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { getProfile, saveProfile } from '../utils/profilestore';

export default function Profile() {
  const [form, setForm] = useState(getProfile());
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(form.avatarUrl || '');

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'profile.v1') setForm(getProfile());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);

    // store as DataURL locally (easy; later you can swap to real uploads)
    const reader = new FileReader();
    reader.onload = () =>
      setForm((f) => ({ ...f, avatarUrl: reader.result || '' }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    setSaving(true);
    saveProfile(form);
    // tiny UX pause
    setTimeout(() => setSaving(false), 250);
  };

  return (
    <section className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

      <div className="flex items-center gap-4 mb-4">
        <img
          src={
            preview ||
            form.avatarUrl ||
            'https://via.placeholder.com/80?text=Avatar'
          }
          alt="avatar"
          className="h-20 w-20 rounded-full object-cover border"
        />
        <label className="px-3 py-2 border rounded cursor-pointer">
          <input type="file" accept="image/*" onChange={onAvatar} hidden />
          Upload Avatar
        </label>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm">Name</span>
          <input
            className="border rounded p-2"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Your name"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Email</span>
          <input
            className="border rounded p-2"
            name="email"
            value={form.email || ''}
            onChange={onChange}
            placeholder="you@example.com"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Bio</span>
          <textarea
            className="border rounded p-2"
            rows={4}
            name="bio"
            value={form.bio || ''}
            onChange={onChange}
            placeholder="Tell people about you…"
          />
        </label>

        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </section>
  );
}