"use client"

import { useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuthId } from '@/store/slices/authId';
import { setIsAuth } from '@/store/slices/isAuth';

export default function UserId() {
  const [userId, setUserId] = useState<string>(null);
  const authId = useAppSelector((state) => state.authId.value);
  const dispatch = useAppDispatch();
  
  
  useEffect(() => {
    
      account.get()
      .then((user: string) => {
        setUserId(user.$id);
        dispatch(setAuthId(user.$id))
        dispatch(setIsAuth(true))
        
      })
      .catch((error) => {
        console.error('User not authenticated:', error);
        setUserId(null);
      });
    
      
  });

  
  return <p className=""></p>;
}