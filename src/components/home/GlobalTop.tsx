"use client"

import React from 'react';

const GlobalTop = () => {
  return (
    <div className="max-w-md mx-auto p-4 my-4 rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-[1.1rem] mb-3 font-bold text-gray-200">GLOBAL TOP 200</h2>
        <h1 className="text-[1.3rem] font-bold text-gray-200">
          Top songs being discovered around the world right now
        </h1>
        <p className="text-gray-200 mt-2 text-[0.8rem]">
          list of the top songs worldwide on asbeatcloud
        </p>
      </div>
      <div className="mt-4 relative">
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <img
            src="https://plus.unsplash.com/premium_photo-1682144168842-85fe1f31532b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Chart background"
            className="w-full h-52 object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <h3 className="text-lg font-semibold">GLOBAL TOP 200 CHART</h3>
              <p className="text-sm mt-1">
                Featuring songs from Alex Warren, Lola Young, EMIN & JONY and more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalTop;