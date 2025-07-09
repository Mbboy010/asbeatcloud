import type { Metadata } from 'next';
import Instrumental from '@/components/instrumental/Instrumental';

export const metadata: Metadata = {
  title: 'Instrumentals',
  description: 'Explore instrumentals on AsbeatCloud by genre, scale, and key. Discover new uploads and upload your own beats.',
};

export default function InstrumentalPage() {
  return (
    <div className="container mx-auto mt-16">
      <Instrumental />
    </div>
  );
}