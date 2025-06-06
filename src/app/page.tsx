'use client';

import BeatsList from '../components/home/BeatsList';
import SongCarousel from '../components/home/SongCarousel';
import InstrumentalCategories from '../components/home/InstrumentalCategories';
import { useState } from 'react';

import UploadSection from '@/components/nav/UploadSection';

export default function Home() {
  

  return (
    <div className="min-h-screen text-gray-200 bg-[#000000] pt-16">


      <main className="container mx-auto mt-8">
   
       <InstrumentalCategories /> 
       <SongCarousel />
       <BeatsList />

      </main>
    </div>
  );
}