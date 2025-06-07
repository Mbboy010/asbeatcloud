'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const AboutWebsite = () => {
  const router = useRouter();

  // Current date and time
  const currentDate = new Date();
  const lastUpdated = currentDate.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'Africa/Lagos', // WAT timezone
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className=" p-6 rounded-lg text-gray-200"
    >
      <h2 className="text-2xl font-bold mb-6">AsbeatCloud</h2>
      <div className="space-y-4">
        <p className=""><strong>AsbeatCloud</strong>, your ultimate destination for discovering and downloading the latest beats and music from top artists worldwide. Launched with a passion for music, we aim to connect artists with fans and provide a seamless experience for music enthusiasts.
        </p>

        <div>
          <p className=" font-semibold">Key Features:</p>
          <ul className="list-disc list-inside ml-4 mt-2 ">
            <li>Explore a curated collection of beats and top artists.</li>
            <li>Download high-quality tracks with ease.</li>
            <li>Stay updated with the latest releases and artist profiles.</li>
          </ul>
        </div>

        <p className="">
          Our mission is to celebrate musical diversity and support emerging talents. Join us on this rhythmic journey!
        </p>

        <p className="text-sm ">
          Last Updated: {lastUpdated}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-200"
          onClick={() => router.push('/explore')}
        >
          Explore Now
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AboutWebsite;