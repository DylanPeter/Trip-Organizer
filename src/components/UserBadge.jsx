// src/components/UserBadge.jsx
import React, { useEffect, useState } from 'react';
import { getProfile } from '../utils/profilestore';

export default function UserBadge() {
  const [p, setP] = useState(getProfile());

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'profile.v1') setP(getProfile());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const avatar =
    p.avatarUrl || 'https://via.placeholder.com/28?text=%F0%9F%91%A4';

  return (
    <div className="flex items-center gap-2">
      <img src={avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
      <span className="text-sm text-gray-700">{p.name || 'Traveler'}</span>
    </div>
  );
}