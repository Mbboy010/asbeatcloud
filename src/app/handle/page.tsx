'use client';
import { useState } from 'react';
import { sendMessage } from '@/utils/sendMessage';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await sendMessage({
        to: 'mbboy010@gmail.com',
        subject: 'you verification code is',
        name: 'Musa hakilu',
        verificationCode: '123456',
      });

      console.log('Message sent:', res);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <button className="mt-20 p-4 bg-red-500 text-white" onClick={handleSend} disabled={loading}>
      {loading ? 'Sending...' : 'Send Message'}
    </button>
  );
}