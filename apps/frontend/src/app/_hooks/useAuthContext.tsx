import React, { useContext } from 'react';
import {
  AuthContext,
  IGlobalAuthProps as AuthContextProps,
} from '../_store/authContext';

export const useAuthContext = () => {
  useContext(AuthContext as React.Context<AuthContextProps>);
};
