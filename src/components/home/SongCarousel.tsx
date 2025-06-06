'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Song {
  id: number;
  title: string;
  artists: string[];
  href: string;
  imageUrl: string;
}

const SongCarousel = () => {
  const allSongs: Song[] = [
    {
      id: 1,
      title: 'Hausa Groove',
      artists: ['Ali Jita', 'Sani Danja'],
      href: '/songs/hausa-groove',
      imageUrl:
        'https://images.unsplash.com/photo-1709870845122-bb30d361f5de?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 2,
      title: 'Afro Rhythm',
      artists: ['Davido', 'Wizkid'],
      href: '/songs/afro-rhythm',
      imageUrl:
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bXVzaWN8ZW58MHx8MHx8fDA%3D',
    },
    {
      id: 3,
      title: 'Rap Flow',
      artists: ['Olamide', 'Phyno'],
      href: '/songs/rap-flow',
      imageUrl:
        'https://images.unsplash.com/photo-1632765866070-3fadf25d3d5b?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 4,
      title: 'Hype Beat',
      artists: ['Skrillex', 'NOTION'],
      href: '/songs/hype-beat',
      imageUrl:
        'https://images.unsplash.com/photo-1688143030645-a84f15553f9f?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 5,
      title: 'Chill Vibes',
      artists: ['HUGEL', 'WiZThe'],
      href: '/songs/chill-vibes',
      imageUrl:
        'https://plus.unsplash.com/premium_photo-1677545820818-f1639f3e5b65?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljfGVufDB8fDB8fHww',
    },
    {
      id: 6,
      title: 'Melodic Drop',
      artists: ['ILLENIUM', 'Taylor Swift'],
      href: '/songs/melodic-drop',
      imageUrl:
        'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.0.3',
    },
    {
      id: 7,
      title: 'Bassline',
      artists: ['Chase & Status', 'Summit'],
      href: '/songs/bassline',
      imageUrl:
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.0.3',
    },
    {
      id: 8,
      title: 'Soulful Tune',
      artists: ['Arijit Singh', 'Atif Aslam'],
      href: '/songs/soulful-tune',
      imageUrl:
        'https://images.unsplash.com/photo-1619983081563-430f63602796?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWN8ZW58MHx8MHx8fDA%3D',
    },
    {
      id: 9,
      title: 'Radio Mix',
      artists: ['Griffin', 'Kaskade'],
      href: '/songs/radio-mix',
      imageUrl:
        'https://images.unsplash.com/photo-1453738773917-9c3eff1db985?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG11c2ljfGVufDB8fDB8fHww',
    },
    {
      id: 10,
      title: 'Hip Hop Jam',
      artists: ['Kendrick Lamar', 'Drake'],
      href: '/songs/hip-hop-jam',
      imageUrl:
        'https://plus.unsplash.com/premium_photo-1682125768864-c80b650614f3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG11c2ljfGVufDB8fDB8fHww',
    },
  ];

  const [displayedSongs, setDisplayedSongs] = useState<Song[]>([]);

  useEffect(() => {
    const shuffleArray = (array: Song[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, 5);
    };
    setDisplayedSongs(shuffleArray(allSongs));
  }, []);

  return (
    <div className="text-gray-200 py-3 px-6 rounded-lg shadow-lg overflow-hidden">
      <h2 className="text-[1.3rem] font-bold mb-3 text-left">
        Featured Playlists
      </h2>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {displayedSongs.map((song) => (
          <Link key={song.id} href={song.href} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-52 rounded-lg py-4 px-1 shadow-md cursor-pointer transition duration-200"
            >
              <div className="mb-2 relative">
                <img
                  src={song.imageUrl}
                  alt={`${song.title} cover`}
                  width={256}
                  height={128}
                  className="w-full h-44 object-cover rounded-md"
                />
              </div>
              <div className="flex items-center mb-2">
                <span className="font-medium hover:bg-gray-700">{song.title}</span>
              </div>
              <p className="text-sm text-gray-400">{song.artists.join(', ')}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SongCarousel;