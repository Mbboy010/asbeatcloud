import React from 'react'

export default function TopArUi() {
  return (
          <div className="p-6 rounded-lg">
        <h2 className="text-[1.3rem] font-bold mb-3 text-left">Featured Top Artists</h2>
        <div className="flex space-x-6 overflow-x-auto scrollbar-hide">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-32 mb-1 rounded-lg overflow-hidden"
            >
              <div className="w-full h-32 bg-gray-700 animate-pulse rounded-full"></div>
              <div className="flex items-center mt-3 justify-center flex-row space-x-2">
                <div className="h-5 bg-gray-700 animate-pulse rounded w-3/4"></div>
                <div className="h-5 w-5 bg-gray-700 animate-pulse rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}