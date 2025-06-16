import ProfileClient from '@/components/profile/ProfileClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile',
  description:
    'Explore your AsbeatCloud profile with dynamic content. Manage your username, view beats, top artists, and artist details. Log in to personalize your music experience!',
  openGraph: {
    title: 'Profile - AsbeatCloud',
    description:
      'Explore your AsbeatCloud profile with dynamic content. Manage your username, view beats, top artists, and artist details. Log in to personalize your music experience!',
    url: 'https://yourdomain.com/profile', // update with your actual URL
    siteName: 'AsbeatCloud',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'AsbeatCloud Profile Image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profile - AsbeatCloud',
    description:
      'Explore your AsbeatCloud profile with dynamic content. Manage your username, view beats, top artists, and artist details. Log in to personalize your music experience!',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    ],
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}