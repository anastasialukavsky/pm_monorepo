'use client';

import React, { useEffect } from 'react';
import { zodLogin } from '../../../../_zodTypes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormData } from '../../../../_types';
import { emailCheck } from '../../../../_utilHelpers';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import visibleIcon from '/public/assets/visible_input.svg';
import hiddenIcon from '../../../../public/assets/hidden_input.svg';
import Image from 'next/image';
import Link from 'next/link';
// import useShowPassword from '@/app/_hooks/useShowPassword';
import { useShowPassword } from '../../../app/_hooks/index';
import Input from '../../../app/_reusable_components/Input';
import Label from '../../../app/_reusable_components/Label';
import { ZodError, z } from 'zod';
import { cookies } from 'next/headers';

const HTTP_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export default function Page() {
  const router = useRouter();
  const { togglePasswordVisibility, showPassword } = useShowPassword();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(zodLogin),
    defaultValues: { email: '', password: '' },
    // mode: 'onBlur',
  });

  useEffect(() => {
    for (const err in errors) {
      if (err === 'password') {
        setValue('password', '');
      }
    }
  }, [errors.password]);

  const emailChecker = async (email: string) => {
    try {
      const isValidEmail = z.string().email().parse(email);
      const emailExists = await emailCheck(isValidEmail);
      if (!emailExists) {
        reset({
          email: '',
        });
        setError('email', {
          type: 'custom',
          message: 'email does not exist',
        });
      } else {
        clearErrors('email');
      }
    } catch (err) {
      if (err instanceof ZodError) {
        if (err.errors[0].message === 'Invalid email') {
          reset({
            email: '',
          });
          setError('email', {
            type: 'custom',
            message: 'not a valid email',
          });
        }
        // console.dir(err);
        console.log(err.errors[0].message);
      } else {
        console.error(err);
        throw err;
      }
    }
  };
  const getCookie = (name: string) => {
    // const cookies = document.cookie
    const cookies = document;
    // const cookie = cookies();
    console.log({ cookies });
    for (const cookie in cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  };
  const getTokens = async () => {
    try {
      const userId = getCookie('user_id');
      if (!userId) {
        console.error(`UserId ${userId} is not found`);
        return;
      }

      const response = await axios.get(
        `${HTTP_ENDPOINT}/auth/get-tokens/${userId}`,
        { withCredentials: true }
      );

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

  const submitData = async (data: LoginFormData) => {
    try {
      const headers = await getTokens();
      const payload = await axios.post(`${HTTP_ENDPOINT}/auth/login`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      });

      console.log({ payload });

      if (payload.status === 200) router.push('/workspace');
      return payload;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 403) {
          reset({
            password: '',
          });
          setError('password', {
            type: 'custom',
            message: 'invalid password',
          });
        }
      } else {
        throw err;
      }
    }
  };

  return (
    <section
      id='login-section'
      className='bg-pink-100 w-[100vw] h-[100vh] flex text-slate-700'
    >
      <div id='form-wrapper' className='self-center mx-auto  h-[20vh] w-[15vw]'>
        <header className='text-center text-3xl font-bold'>
          <h1>LOGIN</h1>
        </header>
        <form
          action='submit'
          onSubmit={handleSubmit(submitData)}
          className='flex flex-col'
        >
          <Label htmlFor='email' label='email' />
          <Input
            type='email'
            autoComplete='email'
            placeholder={errors.email?.message || ''}
            register={register}
            fieldName='email'
            onBlur={(e) => emailChecker(e.target.value)}
          />
          <div className='w-full flex flex-col'>
            <Label htmlFor='password' label='password' />
            <Input
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder={errors.password?.message || ''}
              register={register}
              fieldName='password'
              // className="border border-slate-700"
            />
            <Image
              src={showPassword ? visibleIcon : hiddenIcon}
              width={15}
              height={15}
              alt='eye'
              onClick={togglePasswordVisibility}
              className='cursor-pointer self-end -translate-y-5 -translate-x-1'
            />
            <Link href='/' className='self-end text-xs -translate-y-3'>
              forgot password?
            </Link>
          </div>
          <button className='mt-3 w-full h-fit border border-black font-medium'>
            login
          </button>
        </form>
      </div>
    </section>
  );
}
