'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
// import id from 'date-fns/esm/locale/id/index';
import type { NextApiRequest, NextApiResponse } from 'next';

const HTTP_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
export interface IGlobalAuthProps {
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isLoading: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUser: (user: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export const AuthContext = React.createContext<IGlobalAuthProps>({
  user: {
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
  },
  isLoading: true,
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  setUser: () => {},
  setIsLoading: () => {},
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        setIsLoading,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
