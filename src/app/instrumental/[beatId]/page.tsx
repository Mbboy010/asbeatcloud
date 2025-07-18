import InstrumentalPage from '../../../components/download/InstrumentalPage';
import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Instrumentals',
  description: 'Explore instrumentals on AsbeatCloud by genre, scale, and key. Discover new uploads and upload your own beats.',
};

export default function DownloadPage() {
  return (
    <div className="container mx-auto mt-16">
      <InstrumentalPage />

    </div>
  );
}