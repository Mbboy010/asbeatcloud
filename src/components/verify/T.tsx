'use client';

import React from 'react';
import { sendVerification } from '@/utils/sendVerification';

export default function SendEmailButton() {
  const handleSendEmail = async () => {
    try {
      const result = await sendVerification();
      console.log('Email sent:', result);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <button
      onClick={handleSendEmail}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Send Verification Email
    </button>
  );
}