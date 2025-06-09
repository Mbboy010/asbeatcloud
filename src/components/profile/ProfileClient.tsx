'use client';

import { useState, useEffect } from 'react';
import ArtistProfile from '../../components/profile/ArtistProfile';
import TopArtists from '@/components/home/TopArtists';
import BeatItem from '@/components/profile/BeatItem';
import UserProfile from '@/components/profile/UserProfile';

export default function ProfileClient() {
  const [username, setUsername] = useState<string>('AsBeatCloud User');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username') || 'AsBeatCloud User';
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    const newDescription = `Explore your AsbeatCloud profile, ${username}. Manage your username, view beats, top artists, and artist details. Log in to personalize your music experience!`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', newDescription);
  }, [username]);

  return (
    <div className="container mx-auto mt-16 min-h-screen bg-[#121212] text-gray-200">
      <UserProfile />
      <div className="mt-8">
        <BeatItem />
      </div>
      <div className="mt-8">
        <TopArtists />
      </div>
      <div className="mt-8">
        <ArtistProfile />
      </div>
    </div>
  );
}