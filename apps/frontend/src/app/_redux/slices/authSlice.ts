'use client';

import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { TReduxError } from '../reduxTypes';
import { z } from 'zod';
import { zodSignup } from '../../../../_zodTypes';
import { RootState } from '../store';
const HTTP_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export type UserSignUpInput = z.infer<typeof zodSignup>;

export type AuthState = {
  id: string | null;
  loading: boolean;
  error: TReduxError;
};
const initialState: AuthState = {
  id: null,
  loading: false,
  error: {
    status: null,
    message: null,
  },
};

/**
 * * THUNKS
 */

export const requestSignUp = createAsyncThunk(
  'auth/requestSignUp',
  async (userInput: UserSignUpInput, thunkApi) => {
    try {
      const res: { data: AuthState } = await axios.post(
        HTTP_ENDPOINT + '/auth/signup',
        userInput,
        { withCredentials: true }
      );

      console.log('AUTH THUNK', res);
      console.log('AUTH THUNK', res.data);
      return res.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        return thunkApi.rejectWithValue({
          status: err.response?.status,
          message: err.response?.data.message,
        });
      } else {
        console.error(err);
      }
    }
  }
);

/**
 * * AUTH SLICE
 */

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    /**
     * * requestSignup
     */

    builder
      .addCase(requestSignUp.pending, (state) => {
        state.loading = true;
      })
      .addCase(requestSignUp.fulfilled, (_, { payload }) => {
        return payload;
      })
      .addCase(requestSignUp.rejected, (_, { payload }: PayloadAction<any>) => {
        return { ...initialState, error: payload };
      });
  },
});

export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
