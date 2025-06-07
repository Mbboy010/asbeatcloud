'use client';

import ArtistProfile from '../../components/profile/ArtistProfile';
import TopArtists from '@/components/home/TopArtists';
import BeatItem from '@/components/profile/BeatItem';
import UserProfile from '@/components/profile/UserProfile';


export default function Home() {
  return (
    <div className="container mx-auto mt-16 min-h-screen text-gray-200 bg-[#121212]">
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