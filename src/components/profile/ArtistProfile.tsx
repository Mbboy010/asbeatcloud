'use client';

import React from 'react';

const ArtistProfile = () => {
  // Sample artist data
  const artist = {
    name: 'user name',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80', // Placeholder image
    hometown: 'Port Harcourt, Rivers State, Nigeria',
    birthDate: '2 July 1991',
    genre: 'Afro-fusion',
  };

  return (
    <div className="text-gray-200 p-6 rounded-xl max-w-md mx-auto my-6">
      <h1 className="text-[1.2rem] font-bold mb-4">{artist.name}</h1>
      <div className="relative mt-7">
        <img
          src={artist.imageUrl}
          alt={`${artist.name} profile`}
          className="w-full h-96 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50 rounded-lg"></div>
      </div>
      <div className="mt-4 space-y-2">
        <div>
          <h3 className="text-sm font-medium text-gray-400">Hometown</h3>
          <p className="text-md">{artist.hometown}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400">Born</h3>
          <p className="text-md">{artist.birthDate}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400">Genre</h3>
          <p className="text-md">{artist.genre}</p>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;