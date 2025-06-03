'use client';

import { useState } from 'react';
import Navbar from '@/components/nav/Navbar';
import Sidebar from '@/components/nav/Sidebar';
import UploadSection from '@/components/nav/UploadSection';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen pt-16">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="container mx-auto mt-8">
        <UploadSection />
      </main>
    </div>
  );
}