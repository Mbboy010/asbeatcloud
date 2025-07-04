import ForgotPassword from '@/components/forgot/ForgotPassword';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your AsbeatCloud password in three steps: submit your email, verify the reset code, and set a new password. Log out if needed.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto mt-16 p-4">
      <ForgotPassword />
    </div>
  );
}