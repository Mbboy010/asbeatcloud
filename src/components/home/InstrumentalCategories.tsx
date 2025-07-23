'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // ✅ Import usePathname
import { Heart, Music, Mic, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  isActive?: boolean;
  iconColor?: string; // Add optional icon color prop
}

const CategoryCard = ({ icon, title, href, isActive = false, iconColor = 'text-gray-200' }: CategoryCardProps) => (
  <Link href={href} passHref>
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center bg-[#2A2A2A] p-4 rounded-lg shadow-md cursor-pointer ${
        isActive ? '' : ''
      }  transition duration-200`}
    >
      <div className={`mr-4 ${iconColor}`}>{icon}</div> {/* Apply dynamic icon color */}
      <span className="text-gray-200 hover:text-gray-700 font-medium">{title}</span>
      {isActive && <span className="ml-auto text-green-200 text-xs">● ● ●</span>}
    </motion.div>
  </Link>
);

export default function InstrumentalCategories() {
  const pathname = usePathname(); // ✅ Now this will work

  return (
    <div className=" text-gray-200 py-3 px-6 rounded-lg ">
      <h2 className="text-[1.3rem]  font-bold mb-3 text-left text-gray-200">
        Instrumental Genres
      </h2>
 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CategoryCard
          icon={<Heart className="h-6 w-6" />}
          title="Hausa"
          href="/instrumental/type/hausa"
          isActive={pathname === '/instrumental/type/hausa'}
          iconColor="text-red-400"
        />
        <CategoryCard
          icon={<Music className="h-6 w-6" />}
          title="Afro"
          href="/instrumental/type/afro"
          isActive={pathname === '/instrumental/type/afro'}
          iconColor="text-yellow-400"
        />
        <CategoryCard
          icon={<Mic className="h-6 w-6" />}
          title="Hip hop"
          href="/instrumental/type/hiphop"
          isActive={pathname === '/instrumental/type/hiphop'}
          iconColor="text-blue-400"
        />
        <CategoryCard
          icon={<MoreHorizontal className="h-6 w-6" />}
          title="Others"
          href="/instrumental/type/others"
          isActive={pathname === '/instrumental/type/others'}
          iconColor="text-purple-400"
        />
      </div>
    </div>
  );
}