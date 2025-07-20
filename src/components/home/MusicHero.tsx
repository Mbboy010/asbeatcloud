'use client';
import { motion } from 'framer-motion';
import {ClockArrowDown, Music, Music2, Headphones, ShoppingCart } from 'lucide-react';

export default function MusicHero() {
  return (
    <div className="min-h-[33rem] md:min-h-[30rem] flex items-center justify-center px-4 md:px-6 lg:px-10 relative overflow-hidden">
      <div className="w-full h-[32rem] md:h-auto rounded-lg bg-gradient-to-br from-yellow-600 via-blue-600 to-orange-600 flex items-center justify-center py-1 md:py-16">
        {/* Floating Icons */}
        <motion.div
          
          className="absolute top-[17rem] md:top-[5rem] left-16 lg:left-12 md:left-8 w-8 h-8 bg-yellow-400 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Music className="w-4 h-4" />
        </motion.div>
        <motion.div
          
          className="absolute top-[23rem] md:top-[15rem] lg:top-[19rem]  opacity-30 left-14 md:left-36 lg:left-64 rounded-full flex items-center justify-center "
        >
          <ClockArrowDown className="w-32 font-mono h-32 text-gray-300 " />
        </motion.div>

        <motion.div
          
          className="absolute top-[3rem] md:top-[12rem] right-16 md:right-8 lg:right-12 w-8 h-8 bg-fuchsia-400 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Headphones className="w-4 h-4" />
        </motion.div>
        
      {/*image icon*/}
        
     <div className=" absolute bottom-[13rem] md:bottom-[8rem] right-4 md:right-64 lg:right-[20rem] w-24 h-24 ">
        
      <motion.div
          
          className="absolute opacity-80 top-[1rem] w-6 h-6 bg-blue-400 right-6 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Headphones className="w-3 h-3" />
        </motion.div>

      <motion.div
          
          className="absolute opacity-80 top-[3.3rem] w-6 h-6 bg-pink-500 right-4 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Music className="w-3 h-3" />
        </motion.div>


        <motion.div
          
          className="absolute opacity-90 bottom-[2rem] left-6  h-4 w-4 bg-orange-400 text-white rounded-full flex items-center justify-center shadow-lg"
        >
          <Music2 className="w-2 h-2" />
        </motion.div>
       
       </div>
        {/* Content */}
        <div className="grid md:grid-cols-2 items-center gap-6 md:gap-10 max-w-6xl w-full mx-auto z-10 px-4">
          {/* Text */}
          <div className=" md:text-left">
            <h1 className="text-2xl md:text-3xl mt-3 md:mt-auto lg:text-4xl font-extrabold text-gray-200 leading-tight mb-4">
              AsbeatCloud Brings<br />
              The Rhythm of Legends<br />
              To Your Soul <span className="inline-block">🔥</span>
            </h1>
            <p className="text-gray-300 text-md md:text-base mb-6 max-w-md mx-auto md:mx-0">
              Discover timeless tracks like Bohemian Rhapsody and Africa, crafted by icons like Queen and Toto, in a layout that inspires.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-orange-500  hover:bg-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold shadow-lg flex gap-2 transition"
            >
              Downloaded Now
              <ShoppingCart className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Image */}
          <motion.div
            className="relative flex justify-end"
          >
            <div className="w-48 h-60 md:w-60 md:h-[18rem] lg:w-[18rem] lg:h-[22rem]  relative ">
              <img
                src="https://fra.cloud.appwrite.io/v1/storage/buckets/6849a34c0027417cde77/files/687255770029c8dc6f19/view?project=6840dd66001574a22f81&mode=admin"
                alt="Girl enjoying AsbeatCloud"
                className="object-cover w-full h-full"
              />

            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
