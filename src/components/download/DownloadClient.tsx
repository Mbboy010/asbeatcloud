"use client"

import InstrumentalPage from './InstrumentalPage';
import Loading from '../loading/Loading';
import React, { useState,useEffect } from 'react';

export default function DownloadClient() {
  
  const [loadi,setLoadi] = useState<boolean>(false)
  
useEffect(() => {
  setTimeout(() =>{
    setLoadi(true)
  },2000)
},[])
  
  
  
  return (
    <div className="container mx-auto mt-16 min-h-screen bg-[#121212] text-gray-200">
     { loadi ? <InstrumentalPage /> : <Loading /> }
    </div>
  )
}