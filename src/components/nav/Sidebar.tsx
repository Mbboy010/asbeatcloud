'use client';

import { useEffect, useState ,useRef} from 'react';
import { motion } from 'framer-motion';
import { X, Home, UploadCloud, Music, Mic, Phone, Info, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setIsAside } from '@/store/slices/asideCheck';
import { usePathname } from 'next/navigation'; // Import usePathname for URL detection


interface SidebarProps {
  toggleSidebar: () => void;
}

export default function Sidebar() {
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);
  const asideMode = useAppSelector((state) => state.isAs.value);

  const dispatch = useAppDispatch();
  const toggleSidebar = () => dispatch(setIsAside(false));
  const [dis, setDis] = useState<boolean>(false);
  const [lef, setLef] = useState<boolean>(false);
  const [op, setOp] = useState<boolean>(false);

  // Mock authentication state (replace with actual auth logic)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current && asideMode ) {
      dispatch(setIsAside(false))// URL changed
    } 
    prevPathname.current = pathname;
  }, [pathname]);
    
    
  useEffect(() => {
    if (asideMode) {
      setDis(true);
      setTimeout(() => {
        setLef(true);
        setOp(true);
      }, 90);
    } else {
      setLef(false);
      setOp(false);
      setTimeout(() => {
        setDis(false);
      }, 500);
    }
  }, [asideMode]);

  return (
    <div
      className={`fixed text-gray-200 top-0 left-0 min-h-screen w-screen z-40 ${dis ? 'block' : 'hidden'}`}
    >
      <div
        onClick={toggleSidebar}
        className={`backdrop-blur-sm duration-500 bg-[#00000053] absolute top-0 left-0 z-10 w-screen h-screen ${op ? 'opacity-100' : 'opacity-0'}`}
      ></div>
      <div
        className={`absolute z-20 border-r duration-500 border-gray-800 bg-[#121212] top-0 h-full w-[75vw] ${lef ? 'left-0' : 'left-[-75vw]'}`}
      >
        {/* Header with Close Button - Only on mobile when open */}
        <div className="flex p-5 justify-between bg-[#121212] items-center mb-6 md:hidden">
          <Link href="/" className="flex items-center space-x-2" aria-label="Home">
            <img src="/logo.png" alt="AsbeatCloud Logo" className="h-8 w-8" />
            <h2 className="text-xl font-bold">AsbeatCloud</h2>
          </Link>
          <button onClick={toggleSidebar}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation - Always visible on desktop, conditional on mobile */}
        <nav className="space-y-4">
          <Link href="/" className={`flex items-center space-x-2 p-2 rounded`}>
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link href="/upload" className={`flex items-center space-x-2 p-2 rounded`}>
            <UploadCloud className="h-5 w-5" />
            <span>Upload Music</span>
          </Link>
          <Link href="/tracks" className={`flex items-center space-x-2 p-2 rounded`}>
            <Music className="h-5 w-5" />
            <span>My Tracks</span>
          </Link>
          <Link href="/instrumentals" className={`flex items-center space-x-2 p-2 rounded`}>
            <Mic className="h-5 w-5" />
            <span>Instrumentals</span>
          </Link>
          {isAuthenticated ? (
            <Link href="/logout" className={`flex items-center space-x-2 p-2 rounded`} onClick={() => setIsAuthenticated(false)}>
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Link>
          ) : (
            <Link href="/login" className={`flex items-center space-x-2 p-2 rounded`}>
              <LogIn className="h-5 w-5" />
              <span>Login</span>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}