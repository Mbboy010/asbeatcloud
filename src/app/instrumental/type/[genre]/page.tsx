import Pagination from '../../../../components/instrumentalPag/Pagination';
import Link from 'next/link';
import BeatCard from '@/components/instrumentalPag/BeatCard';
import { getBeatsByGenre, Beat } from '@/lib/getBeatsByGenre';
import { Metadata } from 'next';

interface PageProps {
  params: {
    genre: string;
  };
  searchParams: {
    page?: string;
  };
}

// Dynamic metadata
export async function generateMetadata({ params }: PageProps.params): Promise<Metadata> {
  const genre = params.genre;
  const capitalizedGenre = genre.charAt(0).toUpperCase() + genre.slice(1);

  return {
    title: `${capitalizedGenre} Beats - Your Music Platform`,
    description: `Explore a curated collection of ${capitalizedGenre} beats. Discover high-quality instrumentals for your next project.`,
    keywords: `${capitalizedGenre} beats, music instrumentals, ${capitalizedGenre} music, buy beats, music production`,
    openGraph: {
      title: `${capitalizedGenre} Beats`,
      description: `Find the best ${capitalizedGenre} beats for your music projects.`,
      url: `https://yourdomain.com/genres/${genre}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${capitalizedGenre} Beats`,
      description: `Discover top ${capitalizedGenre} beats for your next hit.`,
    },
  };
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const genre = params.genre;
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 6; // Adjust as needed
  const { beats, total } = await getBeatsByGenre(genre, page, limit);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen flex mt-16 justify-center py-8">
      <div className="max-w-4xl w-full rounded-lg p-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-200 mb-6">{genre.charAt(0).toUpperCase() + genre.slice(1)} 
        Beats</h2>

        <div className="w-full min-h-[48rem]">
          {beats.length === 0 ? (
            <p className="text-gray-600">No beats found in this genre.</p>
          ) : (
            <div className="space-y-6">
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
}