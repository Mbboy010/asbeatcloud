import DownloadClient from '../../../components/download/DownloadClient';
import { Metadata } from 'next';
import { databases } from '@/lib/appwrite';
import { Query, Models } from 'appwrite';
 // Adjust the import path as needed

// Environment variables
const DATABASE_ID = process.env.NEXT_PUBLIC_USERSDATABASE!; // Update to songs database
const COLLECTION_ID =  '686a7cd100087c08444a'; // Update to songs collection

// Define the Appwrite document type for your songs collection
interface SongDocument extends Models.Document {
  title: string;
  uploadDate: string;
  key: string;
  scale: string;
  genre: string;
  tempo: number;
  imageId: string;
  musicId: string;
  docId: string;
  duration: string;
  name: string;
  downloads: number;
  postId: string;
}

// Define the song type for your application
export interface Song {
  $id: string;
  title: string;
  uploadDate: string;
  key: string;
  scale: string;
  genre: string;
  tempo: number;
  imageId: string;
  musicId: string;
  docId: string;
  duration: string;
  name: string;
  downloads: number;
  postId: string;
}

// Props for the page and metadata
type PageProps = {
  params: Promise<{ beatId: string }>; // Changed to beatId
};

// Map Appwrite document to Song interface
function mapDocumentToSong(doc: SongDocument): Song {
  return {
    $id: doc.$id,
    title: doc.title,
    uploadDate: doc.uploadDate,
    key: doc.key,
    scale: doc.scale,
    genre: doc.genre,
    tempo: doc.tempo,
    imageId: doc.imageId,
    musicId: doc.musicId,
    docId: doc.docId,
    duration: doc.duration,
    name: doc.name,
    downloads: doc.downloads,
    postId: doc.postId,
  };
}

// Fetch song data from Appwrite
async function getSong(beatId: string): Promise<Song | null> {
  try {
    const response = await databases.listDocuments<SongDocument>(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('postId', beatId)] // Adjust query based on unique identifier
    );

    if (response.documents.length === 0) {
      return null;
    }

    return mapDocumentToSong(response.documents[0]);
  } catch (error) {
    console.error('Error fetching song from Appwrite:', error);
    return null;
  }
}

// Generate dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { beatId } = await params;
  const song = await getSong(beatId);

  if (!song) {
    return {
      title: 'Song Not Found',
      description: 'This song does not exist.',
    };
  }

  const imageUrl = song.imageId ? `https://fra.cloud.appwrite.io/v1/storage/buckets/6849a34c0027417cde77/files/${song.imageId}/view?project=6840dd66001574a22f81&mode=admin` : 'default-image-url';

  return {
    title: `${song.title}`,
    description: `Listen to ${song.title} by ${song.name} on AsbeatCloud.`,
    openGraph: {
      title: `${song.title} - AsbeatCloud`,
      description: `Listen to ${song.title} by ${song.name} on AsbeatCloud.`,
      url: `https://asbeatcloud.vercel.app/songs/${song.postId}`,
      siteName: 'AsbeatCloud',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${song.title} Cover Image`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${song.title} - AsbeatCloud`,
      description: `Listen to ${song.title} by ${song.name} on AsbeatCloud.`,
      images: [imageUrl],
    },
  };
}

// Page component
export default async function SongsPage({ params }: PageProps) {
  const { beatId } = await params;
  const song = await getSong(beatId);

  return <DownloadClient  /> ; // Adjust the component to handle song data
}