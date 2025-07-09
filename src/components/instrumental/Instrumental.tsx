'use client';

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
  

  return (
    <motion.div

      className="min-h-[100vh]  bg-[#121212] text-gray-200"
    >

   <InstrumentalCategories />
    <CTempo />
   <BeatsList />
   <GlobalTop />
   <TopArtists />


    </motion.div>
  );
}