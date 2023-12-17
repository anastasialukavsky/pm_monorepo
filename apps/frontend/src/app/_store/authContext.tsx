'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const HTTP_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
export interface IGlobalAuthProps {
  user: any;
  isLoading: boolean;
  setUser: (user: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export const AuthContext = React.createContext<IGlobalAuthProps>({
  user: {},
  isLoading: true,
  setUser: () => {},
  setIsLoading: () => {},
});

export const AuthContextProvider = (props: any) => {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // const getCookie = (userId: string) => {
  //   const cookie = Cookies.get(userId);
  //   console.log({ cookie });
  //   return cookie ? decodeURIComponent(cookie) : null;

  // };

  const getTokens = async () => {
    try {
      const userId = getCookie('user_id');

      console.log({ 'login frontend userID': userId });
      // if (!userId) {
      //   console.error(`UserId ${userId} is not found`);
      //   return;
      // }

      const response = await axios.get(
        `${HTTP_ENDPOINT}/auth/get-tokens/${userId}`,
        { withCredentials: true }
      );

      console.log({ response });
      const { access_token, refresh_token } = response.data;

      const headers = {
        Authorization: `Bearer ${access_token}`,
      };

      return headers;
    } catch (err) {
      console.error('Error getting tokens: ', err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = await getTokens();
        console.log({ headers });
        const payload = await axios.get(
          'http://localhost:3333/auth/authentication-check',
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
          }
        );
        // console.log({ payload });
        setUser(payload.data);
        setIsLoading(false);
        console.log('payload from context', payload.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log({ user, isLoading });
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        setIsLoading,
      }}
    >
      {props?.children}
    </AuthContext.Provider>
  );
};
function getCookie(arg0: string) {
  throw new Error('Function not implemented.');
}
