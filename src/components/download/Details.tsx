import React from 'react'

interface props{
instrumental: any;
}

export default function Details({instrumental}:props) {
  return (
  <>

  {/* Instrumental Details */}
  <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-6 text-gray-300 text-base">
          <div>
            <span className="font-semibold">Genre:</span> {instrumental.genre}
  </div>
          <div>
            <span className="font-semibold">Tempo:</span> {instrumental.tempo} BPM
  </div>
          <div>
            <span className="font-semibold">Key:</span> {instrumental.key}
  </div>
          <div>
            <span className="font-semibold">Scale:</span> {instrumental.scale}
  </div>
          <div>
            <span className="font-semibold">Downloads:</span> {instrumental.downloads.toLocaleString()}
  </div>
          <div>
            <span className="font-semibold">Likes:</span> {instrumental.likes.toLocaleString()}
  </div>
  </div>

  </>
  )
  }