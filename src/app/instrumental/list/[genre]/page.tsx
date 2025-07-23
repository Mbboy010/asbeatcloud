import Link from 'next/link';
import BeatCard from '@/components/instrumentalPag/BeatCard';
import { getBeatsByGenre, Beat } from '@/lib/getBeatsByGenre';

interface PageProps {
  params: {
    genre: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const genre = params.genre;
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 6; // Adjust as needed
  const { beats, total } = await getBeatsByGenre(genre, page, limit);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen flex mt-16 justify-center  py-8">
      <div className="max-w-4xl w-full  rounded-lg p-6 shadow-lg ">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
          Beats in {genre.charAt(0).toUpperCase() + genre.slice(1)}
        </h2>

        {beats.length === 0 ? (
          <p className="text-gray-600">No beats found in this genre.</p>
        ) : (
          <div className="space-y-6 bg-green-500  ">
            {beats.map((beat) => (
              <BeatCard key={beat.id} beat={beat} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <Link
            href={`/instrumental/list/${genre}?page=${page > 1 ? page - 1 : 1}`}
            className={`px-4 py-2 rounded text-white ${page === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            Previous
          </Link>
          <span className="text-gray-700">Page {page} of {totalPages}</span>
          <Link
            href={`/instrumental/list/${genre}?page=${page < totalPages ? page + 1 : totalPages}`}
            className={`px-4 py-2 rounded text-white ${page >= totalPages ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}