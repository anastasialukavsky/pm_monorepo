'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'http://localhost:3333/auth/authentication-check'
        );
        setUser(response.data);
        setIsLoading(false);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    
    fetchData();
  }, []);
  //check if the user is logged in (headers?)
  //set user state and loading to false
  console.log({ user });
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
