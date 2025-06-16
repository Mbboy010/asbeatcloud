"use client"


import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useRouter , useParams ,usePathname} from 'next/navigation';

export default function AuthNav() {
  
  const authId = useAppSelector((state) => state.authId.value);
  const isAuth = useAppSelector((state) => state.isAuth.value);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() =>{
    if(!isAuth){
      
      if(pathname == `/profile/edit`) return router.push(`/login`);
      if(pathname == "/signup") return router.push(`/signup`);
      if(pathname == "/login" ) return router.push(`/login`);
      
    }else{
      if(pathname == "/login" || pathname == "/signup") return 
        router.push(`/profile/${authId}`);
      if(pathname == `/profile/edit`) return router.push(`/profile/edit`);
    }  
  },[isAuth,authId])
  
  return (
    <div></div>
  )
}