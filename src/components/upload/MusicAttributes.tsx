'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Minus } from 'lucide-react';

// Music genres array
const musicGenres = [
  'Hip Hop',
  'Jazz',
  'Rock',
  'Pop',
  'Electronic',
  'Classical',
  'R&B',
  'Reggae',
  'Country',
  'Blues',
];

// Musical scales and keys
const scales = ['Major', 'Minor', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian'];
const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface MusicAttributesProps {
  genre: string;
  setGenre: (genre: string) => void;
  tempo: number;
  setTempo: (tempo: number) => void;
  scale: string;
  setScale: (scale: string) => void;
  musicKey: string; // Renamed from 'key' to 'musicKey'
  setMusicKey: (key: string) => void; // Renamed from 'setKey' to 'setMusicKey'
  errors: { [key: string]: string };
}

export default function MusicAttributes({
  genre,
  setGenre,
  tempo,
  setTempo,
  scale,
  setScale,
  musicKey, // Renamed from 'key'
  setMusicKey, // Renamed from 'setKey'
  errors,
}: MusicAttributesProps) {
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isScaleOpen, setIsScaleOpen] = useState(false);
  const [isKeyOpen, setIsKeyOpen] = useState(false);

  const handleTempoChange = (increment: boolean) => {
    setTempo(increment ? Math.min(tempo + 1, 200) : Math.max(tempo - 1, 40));
  };

  return (
    <div className="space-y-6">
      {/* Genre Selection */}
      <div>
        <label className="text-gray-300 text-sm mb-2 block">Music Genre</label>
        <div className="relative">
          <motion.button
            type="button"
            onClick={() => setIsGenreOpen(!isGenreOpen)}
            className="w-full bg-[#2A2A2A] text-gray-200 rounded-lg py-2 px-3 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-orange-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{genre || 'Select Genre'}</span>
            <ChevronDown className={`h-5 w-5 transform ${isGenreOpen ? 'rotate-180' : ''} transition-transform`} />
          </motion.button>
          <AnimatePresence>
            {isGenreOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="absolute z-10 w-full bg-gray-700 rounded-lg mt-1 overflow-hidden"
              >
                {musicGenres.map((g) => (
                  <motion.div
                    key={g}
                    className="px-3 py-2 hover:bg-orange-500 hover:text-white cursor-pointer"
                    onClick={() => {
                      setGenre(g);
                      setIsGenreOpen(false);
                    }}
                    whileHover={{ x: 5 }}
                  >
                    {g}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {errors.genre && <p className="text-red-500 text-sm mt-1">{errors.genre}</p>}
      </div>

      {/* Tempo Input */}
      <div>
        <label className="text-gray-300 text-sm mb-2 block">Tempo (BPM)</label>
        <div className="relative flex items-center">
          <motion.button
            type="button"
            onClick={() => handleTempoChange(false)}
            className="bg-gray-600 p-2 rounded-l-lg hover:bg-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Minus className="h-5 w-5 text-gray-200" />
          </motion.button>
          <input
            type="number"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            className="w-full bg-[#2A2A2A] text-gray-200 text-center py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            min="40"
            max="200"
          />
          <motion.button
            type="button"
            onClick={() => handleTempoChange(true)}
            className="bg-gray-600 p-2 rounded-r-lg hover:bg-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-5 w-5 text-gray-200" />
          </motion.button>
        </div>
        <p className="text-gray-400 text-sm mt-1 text-center">{tempo} BPM</p>
        {errors.tempo && <p className="text-red-500 text-sm mt-1">{errors.tempo}</p>}
      </div>

      {/* Scale and Key Selection */}
      <div>
        <label className="text-gray-300 text-sm mb-2 block">Scale & Key</label>
        <div className="flex space-x-4">
          {/* Scale Dropdown */}
          <div className="relative flex-1">
            <motion.button
              type="button"
              onClick={() => setIsScaleOpen(!isScaleOpen)}
              className="w-full bg-[#2A2A2A] text-gray-200 rounded-lg py-2 px-3 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{scale || 'Select Scale'}</span>
              <ChevronDown className={`h-5 w-5 transform ${isScaleOpen ? 'rotate-180' : ''} transition-transform`} />
            </motion.button>
            <AnimatePresence>
              {isScaleOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="absolute z-10 w-full bg-gray-700 rounded-lg mt-1 overflow-hidden"
                >
                  {scales.map((s) => (
                    <motion.div
                      key={s}
                      className="px-3 py-2 hover:bg-orange-500 hover:text-white cursor-pointer"
                      onClick={() => {
                        setScale(s);
                        setIsScaleOpen(false);
                      }}
                      whileHover={{ x: 5 }}
                    >
                      {s}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Key Dropdown */}
          <div className="relative flex-1">
            <motion.button
              type="button"
              onClick={() => setIsKeyOpen(!isKeyOpen)}
              className="w-full bg-[#2A2A2A] text-gray-200 rounded-lg py-2 px-3 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{musicKey || 'Select Key'}</span>
              <ChevronDown className={`h-5 w-5 transform ${isKeyOpen ? 'rotate-180' : ''} transition-transform`} />
            </motion.button>
            <AnimatePresence>
              {isKeyOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="absolute z-10 w-full bg-gray-700 rounded-lg mt-1 overflow-hidden"
                >
                  {keys.map((k) => (
                    <motion.div
                      key={k}
                      className="px-3 py-2 hover:bg-orange-500 hover:text-white cursor-pointer"
                      onClick={() => {
                        setMusicKey(k);
                        setIsKeyOpen(false);
                      }}
                      whileHover={{ x: 5 }}
                    >
                      {k}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {(errors.scale || errors.musicKey) && (
          <p className="text-red-500 text-sm mt-1">{errors.scale || errors.musicKey}</p>
        )}
      </div>
    </div>
  );
}