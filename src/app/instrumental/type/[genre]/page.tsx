import { NextPage } from 'next';
import { Metadata } from 'next';
import { getBeatsByGenre } from '@/lib/getBeatsByGenre';
import GenreClient from '@/components/instrumentalPag/GenreClient';

// Define PageProps using Next.js types
interface PageProps {
  params: Promise<{ genre: string }>; // params is a Promise
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>; // searchParams is a Promise
}

// Dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { genre } = await params; // Await params to resolve the genre
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

const GenrePage: NextPage<PageProps> = async ({ params, searchParams }) => {
  const { genre } = await params; // Await params to resolve the genre
  const resolvedSearchParams = await searchParams; // Await searchParams to resolve
  const page = parseInt(resolvedSearchParams.page?.toString() || '1', 10);
  const limit = 6; // Adjust as needed
  const { beats, total } = await getBeatsByGenre(genre, page, limit);
  const totalPages = Math.ceil(total / limit);

  return <GenreClient genre={genre} beats={beats} page={page} totalPages={totalPages} />;
};

export default GenrePage;