import Uploaded from '@/components/upload/Upload';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Beat - AsbeatCloud',
  description: 'Upload your beats to AsbeatCloud with a title, description, and preview. Return to profile or log out as needed.',
};

export default function UploadPage() {
  return (
    <div className="container mx-auto mt-16 p-4">
      <Uploaded />
    </div>
  );
}