'use client';

import AboutWebsite from '../components/home/AboutWebsite';
import TopArtists from '../components/home/TopArtists';
import GlobalTop from '../components/home/GlobalTop';
import BeatsList from '../components/home/BeatsList';
import SongCarousel from '../components/home/SongCarousel';
import InstrumentalCategories from '../components/home/InstrumentalCategories';
import { useState } from 'react';

import UploadSection from '@/components/nav/UploadSection';

export default function Home() {
  

  return (
    <div className="min-h-screen text-gray-200 bg-[#121212] pt-16">


      <main className="container mx-auto mt-8">
   
       <InstrumentalCategories /> 
       <GlobalTop />
       <SongCarousel />
       <BeatsList />
       <TopArtists />
       <AboutWebsite />
      </main>
    </div>
  );
}