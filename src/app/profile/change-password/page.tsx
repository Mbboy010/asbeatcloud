import ChangePassword from '@/components/change/ChangePassword';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Change Password - AsbeatCloud',
  description: 'Update your AsbeatCloud password with show/hide toggle. Enter your current password and a new one, then return to profile or log out.',
};

export default function ChangePasswordPage() {
  return (
    <div className="container mx-auto mt-16 p-4">
      <ChangePassword />
    </div>
  );
}