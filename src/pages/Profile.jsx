import React, { useEffect, useState } from "react";
import { getProfile, saveProfile } from "../utils/profilestore";
import "../styles/Profile.css";
import { useAuth0 } from "@auth0/auth0-react";

export default function Profile() {
  const { user, isLoading } = useAuth0();

  const [form, setForm] = useState(() => {
    const base = getProfile();
    return {
      ...base,
      name: user?.name ?? base.name,
      email: user?.email ?? base.email,
      avatarUrl: user?.picture ?? base.avatarUrl,
    };
  });

  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(user?.picture || form.avatarUrl || "");

  useEffect(() => {
    setForm((f) => ({
      ...f,
      name: user?.name ?? f.name,
      email: user?.email ?? f.email,
      avatarUrl: user?.picture ?? f.avatarUrl,
    }));
    setPreview((p) => p || user?.picture || "");
  }, [user]);

  useEffect(() => {
    const onStorage = (e) => e.key === "profile.v1" && setForm(getProfile());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    const reader = new FileReader();
    reader.onload = () =>
      setForm((f) => ({ ...f, avatarUrl: reader.result || "" }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    setSaving(true);
    const { name, email, ...rest } = form;
    const payload = user ? rest : form;
    saveProfile(payload);
    setTimeout(() => setSaving(false), 250);
  };

  return isLoading ? (
    <div className="profile-loader" style={{ padding: "2rem", textAlign: "center" }}>
      Loading profile…
    </div>
  ) : (
    <section className="profile-page">
      <h1>My Profile</h1>

      <div className="flex">
        <img
          src={
            preview ||
            form.avatarUrl ||
            "https://via.placeholder.com/80?text=Avatar"
          }
          alt="avatar"
        />
        <label className="cursor-pointer">
          <input type="file" accept="image/*" onChange={onAvatar} hidden />
          Upload Avatar
        </label>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1">
          <span>Name</span>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Your name"
            disabled={!!user}
          />
        </label>

        <label className="grid gap-1">
          <span>Email</span>
          <input
            name="email"
            value={form.email || ""}
            onChange={onChange}
            placeholder="you@example.com"
            disabled={!!user}
          />
        </label>

        <label className="grid gap-1">
          <span>Bio</span>
          <textarea
            rows={4}
            name="bio"
            value={form.bio || ""}
            onChange={onChange}
            placeholder="Tell people about you…"
          />
        </label>

        <button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </section>
  );
}
