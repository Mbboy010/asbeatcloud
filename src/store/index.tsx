import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import isAsideSlice from "./slices/asideCheck"


export const store = configureStore({
  reducer: {
    theme: themeReducer,
    isAs: isAsideSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;