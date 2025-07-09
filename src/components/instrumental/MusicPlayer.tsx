import React from 'react';
import { Heart, Check, Bookmark, Pause } from 'lucide-react';

const MusicPlayer = () => {
  return (
    <div className="flex items-center justify-center w-screen">
    <div className="flex items-center h-36 bg-gray-700 rounded-xl shadow-md p-2 w-[87vw]">

      <div className="w-[7rem] h-[7rem]">
        <img
          src="https://plus.unsplash.com/premium_photo-1678197937465-bdbc4ed95815?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29ufGVufDB8fDB8fHww"
          alt="Album Art"
          className="w-full h-full rounded-lg"
        />
      </div>
      <div className="ml-4 flex-1">
        <h3 className="text-lg font-semibold">Ghost</h3>
        <p className="text-gray-200">Justin Bieber</p>
      </div>
      <div className="flex items-center space-x-2">
        <button className="text-red-500 hover:text-red-700">
          <Heart size={18} />
        </button>
        <button className="text-purple-500 hover:text-purple-700">
          <Check size={18} />
        </button>
        <button className="text-gray-500 hover:text-gray-700">
          <Bookmark size={18} />
        </button>
      </div>
      </div>
    </div>
  );
};

export default MusicPlayer;