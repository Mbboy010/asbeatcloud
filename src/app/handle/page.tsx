'use client';
import { useState } from 'react';
import { sendMessage } from '@/utils/sendMessage';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      

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