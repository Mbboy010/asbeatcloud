'use client';

import Pagination from './Pagination';
import BeatCard from './BeatCard';
import { Beat } from '@/lib/getBeatsByGenre';

interface GenreClientProps {
  genre: string;
  beats: Beat[];
  page: number;
  totalPages: number;
}

const GenreClient: React.FC<GenreClientProps> = ({ genre, beats, page, totalPages }) => {
  return (
    <div className="min-h-screen flex mt-16 justify-center py-8">
      <div className="max-w-4xl w-full rounded-lg p-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-200 mb-6">
          {genre.charAt(0).toUpperCase() + genre.slice(1)} Beats
        </h2>

        <div className="w-full min-h-[48rem]">
          {beats.length === 0 ? (
            <p className="text-gray-600">No beats found in this genre.</p>
          ) : (
            <div className="space-y-2">
              {beats.map((beat) => (
                <BeatCard key={beat.id} beat={beat} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} genre={genre} />
      </div>
    </div>
  );
};

export default GenreClient;