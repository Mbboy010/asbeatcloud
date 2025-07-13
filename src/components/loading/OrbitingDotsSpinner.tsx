// src/LoadingDots.jsx
import React from 'react';

const OrbitingDotsSpinner = () => {
  return (
    <div className="flex items-center justify-center space-x-2 h-20">
      {[...Array(4)].map((_, i) => (
        <span
          key={i}
          className="w-[0.60rem] h-[0.60rem] rounded-full bg-gray-400 animate-bounce"
          style={{
            animationDelay: `${i * 0.2}s`,
          }}
        ></span>
      ))}
    </div>
  );
};

export default OrbitingDotsSpinner; 