'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Artist {
  id: number;
  name: string;
  imageUrl: string;
  href: string; // Link to artist page
}

const TopArtists = () => {
  const artists: Artist[] = [
    {
      id: 1,
      name: 'MOLI, Silent Ad...',
      imageUrl: 'https://plus.unsplash.com/premium_photo-1678197937465-bdbc4ed95815?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29ufGVufDB8fDB8fHww',
      href: '/artists/1',
    },
    {
      id: 2,
      name: 'Alex Warren',
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
      href: '/artists/2',
    },
    {
      id: 3,
      name: 'Goon Flavc',
      imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
      href: '/artists/3',
    },
    {
      id: 4,
      name: 'Luna Echo',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
      href: '/artists/4',
    },
    {
      id: 5,
      name: 'DJ Vortex',
      imageUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
      href: '/artists/5',
    },
  ];

  return (
    <div className="p-6 rounded-lg ">
      <h2 className="text-[1.3rem] font-bold mb-3 text-left">Featured Top Artists</h2>
      <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
        {artists.map((artist) => (
          <Link key={artist.id} href={artist.href} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 w-48  rounded-lg overflow-hidden cursor-pointer transition duration-200"
            >
              <img
                src={artist.imageUrl}
                alt={`${artist.name} profile`}
                className="w-full h-48 object-cover"
              />
              <div className="p-3 text-center">
                <p className="font-medium truncate">{artist.name}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopArtists;