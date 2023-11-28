import React, { useState } from 'react';

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

export const AuthContextProvider = ({ props }: any) => {
  const [user, setUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);


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
      {props.children}
    </AuthContext.Provider>
  );
};
