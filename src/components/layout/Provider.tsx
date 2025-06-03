'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import ThemeSync from './ThemeSync'; // below

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeSync />
      {children}
    </Provider>
  );
}