// Pagination.jsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface props {
  genre: string;
  page: number;
  totalPages: number;
}

const Pagination = ({ page, totalPages, genre }:props) => {
  return (
    <div className="mt-6 flex w-full justify-around items-center flex-wrap gap-2">
      <motion.div whileTap={{ scale: 0.9 }}>
        <Link
          href={`/instrumental/type/${genre}?page=${page > 1 ? page - 1 : 1}`}
          className={`px-4 py-2 rounded text-white ${page === 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
        >
          Previous
        </Link>
      </motion.div>

      {[...Array(totalPages)].map((_, i) => {
        const pageNum = i + 1;
        return (
          <motion.div key={pageNum} whileTap={{ scale: 0.9 }}>
            <Link
              href={`/instrumental/type/${genre}?page=${pageNum}`}
              className={`px-3 py-1 rounded block text-center ${pageNum === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {pageNum}
            </Link>
          </motion.div>
        );
      })}

      <motion.div whileTap={{ scale: 0.9 }}>
        <Link
          href={`/instrumental/type/${genre}?page=${page < totalPages ? page + 1 : totalPages}`}
          className={`px-4 py-2 rounded text-white ${page >= totalPages ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
        >
          Next
        </Link>
      </motion.div>
    </div>
  );
};

export default Pagination;