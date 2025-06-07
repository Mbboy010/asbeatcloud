'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Beat {
  id: number;
  title: string;
  imageUrl: string;
  dateTime: string;
  duration: string;
  musicType: string;
}

const BeatList = () => {
  const beats: Beat[] = [
    {
      id: 1,
      title: 'Hausa Groove',
      imageUrl:
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bXVzaWN8ZW58MHx8MHx8fDA%3D',
      dateTime: '2025-06-06T13:00:00+01:00',
      duration: '4:30',
      musicType: 'Hausa',
    },
    {
      id: 2,
      title: 'Afro Rhythm',
      imageUrl:
        'https://images.unsplash.com/photo-1632765866070-3fadf25d3d5b?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      dateTime: '2025-06-06T10:30:00+01:00',
      duration: '3:45',
      musicType: 'Afrobeat',
    },
    {
      id: 3,
      title: 'Rap Flow',
      imageUrl:
        'https://images.unsplash.com/photo-1511376777868-611b54f68947?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=128&q=80',
      dateTime: '2025-06-05T18:45:00+01:00',
      duration: '4:15',
      musicType: 'Rap',
    },
    {
      id: 4,
      title: 'Chill Vibes',
      imageUrl:
        'https://images.unsplash.com/photo-1709870845122-bb30d361f5de?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      dateTime: '2025-06-04T09:15:00+01:00',
      duration: '5:00',
      musicType: 'Chill',
    },
    {
      id: 5,
      title: 'Melodic Drop',
      imageUrl:
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=128&q=80',
      dateTime: '2025-06-03T20:00:00+01:00',
      duration: '4:10',
      musicType: 'Melodic Dubstep',
    },
  ];

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-NG', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Africa/Lagos',
    });
  };

  return (
    <div className=" text-gray-200 p-6 rounded-lg">
      <h2 className="text-[1.3rem] font-bold mb-3 text-left">Featured Beats</h2>
      <div className="flex flex-col space-y-3">
        {beats.map((beat) => (
          <Link key={beat.id} href={`/beats/${beat.id}`}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-full  rounded-lg p-3 shadow-md cursor-pointer hover:bg-gray-700 transition duration-200 flex items-center space-x-3"
            >
              <img
                src={beat.imageUrl}
                alt={beat.title}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="font-medium">{beat.title}</h3>
                <p className="text-sm text-gray-400">Type: {beat.musicType}</p>
                <p className="text-sm text-gray-400">Added: {formatDateTime(beat.dateTime)}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
      <div className="mt-4 ml-[0.7rem] text-left">
        <Link href="/beats">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-200"
          >
            See More
          </motion.button>
        </Link>
      </div>
    </div>
  );
};

export default BeatList;