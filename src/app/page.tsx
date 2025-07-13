'use client';

import Loading from '../components/loading/Loading';
import MusicHero from '../components/home/MusicHero';
import AboutWebsite from '../components/home/AboutWebsite';
import TopArtists from '../components/home/TopArtists';
import GlobalTop from '../components/home/GlobalTop';
import BeatsList from '../components/home/BeatsList';
import SongCarousel from '../components/home/SongCarousel';
import InstrumentalCategories from '../components/home/InstrumentalCategories';
import { useState , useEffect } from 'react';

import UploadSection from '@/components/nav/UploadSection';

export default function Home() {
  
     
 const [loading,setLoading] = useState<boolean>(false)
  
useEffect(() => {
  setTimeout(() =>{
    setLoading(true)
  },2000)
},[])
  

  return (
    <div className="min-h-screen text-gray-200 bg-[#121212] pt-16">

      {
        loading ? 
        
       <main className=" container mx-auto mt-8">
      <div className="flex justify-center items-center ">
      <div className="flex justify-center items-center xl:max-w-[80vw] lg:max-w-[82vw] md:max-w-[85vw]">
         <MusicHero />
      </div>
      </div>
       <InstrumentalCategories /> 
       <GlobalTop />
       <SongCarousel />
       <BeatsList />
       <TopArtists />
       <AboutWebsite />
      </main>
      :
      <Loading />

        
      }

    </div>
  );
}