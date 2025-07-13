// ScrollToTop.js
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const ScrollToTop = () => {

const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
};

export default ScrollToTop;
