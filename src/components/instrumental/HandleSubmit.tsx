'use client';

import React, { useState } from 'react';
import { account, databases } from '@/lib/appwrite';

export default function SignupForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus]     = useState('');

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('⏳ Creating account...');

    try {
      // 1. Create the user with username as userId
      await account.create(username, email, password);

      // 2. Optional: Add to "users" collection
      await databases.createDocument(
        process.env.NEXT_PUBLIC_USERSDATABASE as string, // Ensure this is defined in your .env
        '6849aa4f000c032527a9',                           // Your collection ID
        username,                                         // Document ID
        {
          username,
          email,
          createdAt: new Date().toISOString(),
        }
      );

      setStatus('✅ Account created successfully!');
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Signup error:', error);
      setStatus(`❌ ${error?.message || 'Unknown error occurred'}`);
    }
  };

  return (
    <form onSubmit={handleSignup} className="max-w-md mx-auto space-y-4 p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold">Create Account</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Sign Up
      </button>

      {status && (
        <p className="text-sm text-gray-700">{status}</p>
      )}
    </form>
  );
}