// components/MusicDashboard.tsx
import React, { useState, useEffect } from 'react';

interface MusicItem {
  title: string;
  artist: string;
  image?: string;
}

interface ArtistItem {
  name: string;
  image?: string;
}

const MusicDashboard: React.FC = () => {
  const [trending, setTrending] = useState<MusicItem[]>([]);
  const [topArtists, setTopArtists] = useState<ArtistItem[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<MusicItem[]>([]);

  const UNSPLASH_API_KEY = 'YOUR_UNSPLASH_API_KEY';

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Fetch trending images
        const trendingResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=music&per_page=3&client_id=${UNSPLASH_API_KEY}`
        );
        const trendingData = await trendingResponse.json();
        setTrending([
          { title: 'Sharks', artist: 'Imagine Dragons', image: trendingData.results[0]?.urls.small },
          { title: 'God Is a Woman', artist: 'Ariana Grande', image: trendingData.results[1]?.urls.small },
          { title: 'Handson', artist: 'Warren Hue', image: trendingData.results[2]?.urls.small },
        ]);

        // Fetch artist images
        const artistsResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=artist&per_page=4&client_id=${UNSPLASH_API_KEY}`
        );
        const artistsData = await artistsResponse.json();
        setTopArtists([
          { name: 'Khalid', image: artistsData.results[0]?.urls.small },
          { name: 'Taylor Swift', image: artistsData.results[1]?.urls.small },
          { name: 'Justin Bieber', image: artistsData.results[2]?.urls.small },
          { name: 'Paramore', image: artistsData.results[3]?.urls.small },
        ]);

        // Fetch recently played image
        const recentResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=concert&per_page=1&client_id=${UNSPLASH_API_KEY}`
        );
        const recentData = await recentResponse.json();
        setRecentlyPlayed([{ title: 'Ghost', artist: 'Justin Bieber', image: recentData.results[0]?.urls.small }]);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="p-4 bg-white">
      {/* Trending Now Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Trending Now</h2>
          <a href="#" className="text-purple-600 text-sm">See All</a>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {trending.map((item, index) => (
            <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-32 object-cover" />
              <div className="p-2">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-gray-500">{item.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Artists Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Top Artist</h2>
          <a href="#" className="text-purple-600 text-sm">See All</a>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {topArtists.map((artist, index) => (
            <div key={index} className="text-center">
              <img src={artist.image} alt={artist.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
              <p className="text-sm">{artist.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Played Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Recently Played</h2>
          <a href="#" className="text-purple-600 text-sm">See All</a>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 flex items-center">
          {recentlyPlayed[0] && (
            <>
              <img src={recentlyPlayed[0].image} alt={recentlyPlayed[0].title} className="w-16 h-16 mr-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">{recentlyPlayed[0].title}</p>
                <p className="text-xs text-gray-500">{recentlyPlayed[0].artist}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-purple-600 text-sm">♥</button>
                <span className="text-xs text-gray-500">✓</span>
                <button className="bg-gray-300 text-xs px-2 py-1 rounded">Pause</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicDashboard;