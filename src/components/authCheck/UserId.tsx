'use client';

import { useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuthId } from '@/store/slices/authId';
import { setIsAuth } from '@/store/slices/isAuth';
import type { Models } from 'appwrite';

export default function UserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const authId = useAppSelector((state) => state.authId.value);
  const dispatch = useAppDispatch();

  useEffect(() => {
    account.get()
      .then((user: Models.User<Models.Preferences>) => {
        setUserId(user.$id);
        dispatch(setAuthId(user.$id));
        dispatch(setIsAuth(true));
      })
      .catch((error) => {
        console.error('User not authenticated:', error);
        setUserId(""); // Keep empty string instead of null for string type
        dispatch(setIsAuth(false));
      });
  }, [dispatch]); // Add dependency array to avoid repeated calls

  return <p className="text-sm text-gray-600"></p>;
}