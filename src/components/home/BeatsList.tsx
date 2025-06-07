'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Beat {
  id: number;
  title: string;
  artist: string;
  imageUrl: string;
  dateTime: string; // ISO string for date and time
  duration: string; // Duration in "MM:SS" format
  musicType: string; // Music type (e.g., "Hausa", "Afrobeat")
}

const BeatsList = () => {
  // Define 10 beats with duration and music type
  const allBeats: Beat[] = [
    { 
      id: 1, 
      title: 'Hausa Groove kidan mai dadi yake.mp3 hhh', 
      artist: 'Ali Jita', 
      imageUrl: 'https://images.unsplash.com/photo-1688143030645-a84f15553f9f?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      dateTime: '2025-06-06T13:00:00+01:00', // June 6, 2025, 1:00 PM WAT
      duration: '4:30',
      musicType: 'Hausa'
    },
    { 
      id: 2, 
      title: 'Afro Rhythm', 
      artist: 'Davido', 
      imageUrl: 'https://images.unsplash.com/photo-1632765866070-3fadf25d3d5b?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      dateTime: '2025-06-06T12:30:00+01:00', // June 6, 2025, 12:30 PM WAT
      duration: '3:45',
      musicType: 'Afrobeat'
    },
    { 
      id: 3, 
      title: 'Rap Flow', 
      artist: 'Olamide', 
      imageUrl: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=128&q=80',
      dateTime: '2025-06-05T18:45:00+01:00', // June 5, 2025, 6:45 PM WAT
      duration: '4:15',
      musicType: 'Rap'
    },
    { 
      id: 4, 
      title: 'Hype Beat', 
      artist: 'Skrillex', 
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=128&q=80',
      dateTime: '2025-06-05T14:20:00+01:00', // June 5, 2025, 2:20 PM WAT
      duration: '3:20',
      musicType: 'EDM'
    },
    { 
      id: 5, 
      title: 'Chill Vibes', 
      artist: 'HUGEL', 
      imageUrl: 'https://images.unsplash.com/photo-1709870845122-bb30d361f5de?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      dateTime: '2025-06-04T09:15:00+01:00', // June 4, 2025, 9:15 AM WAT
      duration: '5:00',
      musicType: 'Chill'
    },
    { 
      id: 6, 
      title: 'Melodic Drop', 
      artist: 'ILLENIUM', 
      imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=128&q=80',
      dateTime: '2025-06-03T20:00:00+01:00', // June 3, 2025, 8:00 PM WAT
      duration: '4:10',
      musicType: 'Melodic Dubstep'
    },
    { 
      id: 7, 
      title: 'Bassline', 
      artist: 'Chase & Status', 
      imageUrl: 'https://images.unsplash.com/photo-1485278537138-4e8911a13c02?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      dateTime: '2025-06-03T11:30:00+01:00', // June 3, 2025, 11:30 AM WAT
      duration: '3:50',
      musicType: 'Drum and Bass'
    },
    { 
      id: 8, 
      title: 'Soulful Tune', 
      artist: 'Arijit Singh', 
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=128&q=80',
      dateTime: '2025-06-02T15:00:00+01:00', // June 2, 2025, 3:00 PM WAT
      duration: '4:40',
      musicType: 'Indian Pop'
    },
    { 
      id: 9, 
      title: 'Radio Mix', 
      artist: 'Griffin', 
      imageUrl: 'https://images.unsplash.com/photo-1521335629791-0f737347b5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=128&q=80',
      dateTime: '2025-06-01T08:00:00+01:00', // June 1, 2025, 8:00 AM WAT
      duration: '3:30',
      musicType: 'House'
    },
    { 
      id: 10, 
      title: 'Hip Hop Jam', 
      artist: 'Kendrick Lamar', 
      imageUrl: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=128&q=80',
      dateTime: '2025-05-31T22:00:00+01:00', // May 31, 2025, 10:00 PM WAT
      duration: '4:00',
      musicType: 'Hip Hop'
    },
  ];

  const [displayedBeats, setDisplayedBeats] = useState<Beat[]>([]);

  useEffect(() => {
    // Sort beats by dateTime (newest first) and take the top 7
    const sortedBeats = [...allBeats]
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
      .slice(0, 7);
    setDisplayedBeats(sortedBeats);
  }, []);

  // Format date and time for display
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Africa/Lagos', // WAT timezone
    });
  };

  return (
    <div className="text-gray-200 py-3 px-6 rounded-lg">
      <h2 className="text-[1.3rem] font-bold mb-3 text-left">
        Latest Beats
      </h2>
      <div className="flex flex-col space-y-4">
        {displayedBeats.map((beat) => (
          <Link key={beat.id} href={`/beats/${beat.id}`} passHref>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-full rounded-lg p-4 shadow-md cursor-pointer hover:bg-gray-700 transition duration-200 flex items-center space-x-4"
            >
              <div className="flex-shrink-0">
                <img
                  src={beat.imageUrl}
                  alt={`${beat.title} cover`}
                  className="w-24 h-24 object-cover rounded-md"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="font-medium">{beat.title}</span>
                </div>
                <p className="text-sm text-gray-400">Artist: {beat.artist}</p>
                <p className="text-sm text-gray-500">Type: {beat.musicType}</p>
                <p className="text-sm text-gray-500">Duration: {beat.duration}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
      <div className="mt-3 ml-4 text-left">
        <Link href="/beats" passHref>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg shadow-md  transition duration-200"
          >
            See More
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

export default BeatsList;