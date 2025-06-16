import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import isAsideSlice from "./slices/asideCheck"
import isAuthIdSlice from "./slices/authId"
import isAuthSlice from "./slices/isAuth"
import isNavSlice from "./slices/navpic"

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    isAs: isAsideSlice,
    authId: isAuthIdSlice,
    isAuth: isAuthSlice,
    nav: isNavSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;