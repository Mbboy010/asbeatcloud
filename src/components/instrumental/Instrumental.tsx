'use client';

import Loading from '../loading/Loading';
import BKey from './BKey';
import TyGenre from './TyGenre';
import SongCarousel from '../home/SongCarousel';
import CTempo from './CTempo';
import MusicPlayer from './MusicPlayer';
import TopArtists from '../home/TopArtists';
import BeatsList from '../home/BeatsList';
import InstrumentalCategories from '../home/InstrumentalCategories';
import GlobalTop from '../home/GlobalTop';
import MusicDashboard from './MusicDashboard';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Instrumental() {
  
     
     const [loading,setLoading] = useState<boolean>(false)
      
    useEffect(() => {
      setTimeout(() =>{
        setLoading(true)
      },2000)
    },[])

  return (
    <motion.div   className="min-h-[100vh]  bg-[#121212] text-gray-200"  >
        {
          loading ?
          <>
             <InstrumentalCategories />
                <CTempo />
               <BeatsList />
               <SongCarousel />
               <GlobalTop />
               <TopArtists />
               <TyGenre />
               <BKey />
           </>
               :
               <Loading />
        }
    </motion.div>
  );
}