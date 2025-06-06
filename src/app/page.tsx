'use client';

import SongCarousel from '../components/home/SongCarousel';
import InstrumentalCategories from '../components/home/InstrumentalCategories';
import { useState } from 'react';

import UploadSection from '@/components/nav/UploadSection';

export default function Home() {
  

  return (
    <div className="min-h-screen text-white bg-[#000000] pt-16">


      <main className="container mx-auto mt-8">
   
       <InstrumentalCategories /> 
       <SongCarousel />
       
      </main>
    </div>
  );
}