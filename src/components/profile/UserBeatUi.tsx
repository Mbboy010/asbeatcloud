import React from 'react'

export default function UserBeatUi() {
  return (
      <div className="text-gray-200 p-6 rounded-lg">
        <h2 className="text-[1.3rem] font-bold mb-3 text-left">Last Updated</h2>
        <div className="flex flex-col space-y-3">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="w-full rounded-lg p-3  animate-pulse flex items-center space-x-3"
            >
              <div className="w-20 h-20 bg-gray-700 rounded-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}