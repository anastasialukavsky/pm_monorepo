'use client';

import React, { useEffect } from 'react';
import visibleIcon from '../../../../public/svg/visible_input.svg';
import hiddenIcon from '../../../../public/svg/hidden_input.svg';
import { useShowPassword } from '../../../app/_hooks/index';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { zodSignup } from '../../../../_zodTypes';
import { SignUpFormData } from '../../../../_types';
import Input from '../../../app/_reusable_components/Input';
import Label from '../../../app/_reusable_components/Label';
import Image from 'next/image';
import axios from 'axios';
import { ZodError, z } from 'zod';
import { emailCheck } from '../../../../_utilHelpers';
import { isValidPassword } from '../../../../_utilHelpers';

const HTTP_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export default function Page() {
  const router = useRouter();
  const { showPassword, togglePasswordVisibility } = useShowPassword();
  const {
    showPassword: showConfirmPassword,
    togglePasswordVisibility: toggleConfirmPasswordVisibiity,
  } = useShowPassword();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    // setValue,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(zodSignup),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const checkPasswordValidity = async (password: string) => {
    try {
      const validPassword = isValidPassword(password);

      if (!validPassword) {
        reset({
          password: '',
        });
        setError('password', {
          type: 'custom',
          message:
            'must be at least 10 characters, include 2 uppercase letters, and have 2 special characters (e.g., !@#$%^&*()).',
        });
      } else {
        clearErrors('password');
      }
    } catch (err) {
      if (err instanceof ZodError) {
        console.log({ err });
      }
    }
  };

  useEffect(() => {
    // checkPasswordValidity(password);
    // for (let err in errors) {
    //   // if(err) {
    //   // }
    // }
  }, [errors]);

  console.log({ errors });
  useEffect(() => {
    if (errors.confirmPassword) {
      reset({
        password: '',
        confirmPassword: '',
      }),
        setError('confirmPassword', {
          type: 'custom',
          message: 'passwords do not match',
        });
    }
  }, [errors.confirmPassword, errors.password]);

  const emailChecker = async (email: string) => {
    try {
      const isValidEmail = z.string().email().parse(email);
      const emailExists = await emailCheck(isValidEmail);
      if (emailExists) {
        reset({
          email: '',
        }),
          setError('email', {
            type: 'custom',
            message: 'email already exists',
          });
      } else {
        clearErrors('email');
      }
    } catch (err) {
      if (err instanceof ZodError) {
        if ((err.errors[0].message = 'Invalid email')) {
          reset({
            email: '',
          });
          setError('email', {
            type: 'custom',
            message: 'not a valid email',
          });
        }
      } else throw err;
      console.log(err);
    }
  };

  const submitData = async (data: SignUpFormData) => {
    try {
      const payload = await axios.post(`${HTTP_ENDPOINT}/auth/signup`, data, {
        withCredentials: true,
      });

      console.log({ payload });

      if (payload.status === 201) router.push('/workspace');
      return payload;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  return (
    <section
      id="signup-section"
      className="bg-pink-100 w-[100vw] h-[100vh] flex text-slate-700"
    >
      <div id="form-wrapper" className="self-center mx-auto  h-fit w-[35vw]">
        <header className="text-center text-3xl font-bold">
          <h1>Join</h1>
        </header>
        <form
          action="submit"
          className="flex flex-col"
          onSubmit={handleSubmit(submitData)}
        >
          <Label htmlFor="firstName" label="firstName" />
          <Input
            type="text"
            autoComplete="firstName"
            placeholder={errors.firstName?.message || ''}
            register={register}
            fieldName="firstName"
          />
          <Label htmlFor="lastName" label="lastName" />
          <Input
            type="text"
            autoComplete="lastName"
            placeholder={errors.lastName?.message || ''}
            register={register}
            fieldName="lastName"
          />
          <Label htmlFor="email" label="email" />
          <Input
            type="text"
            autoComplete="email"
            placeholder={errors.email?.message || ''}
            register={register}
            fieldName="email"
            onBlur={(e) => emailChecker(e.target.value)}
          />

          <div className="w-full flex flex-col ">
            <Label htmlFor="password" label="password" />
            <Input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={errors.password?.message || ''}
              register={register}
              fieldName="password"
              onBlur={(e) => checkPasswordValidity(e.target.value)}
            />
            <Image
              src={showPassword ? visibleIcon : hiddenIcon}
              width={15}
              height={15}
              alt="eye"
              onClick={togglePasswordVisibility}
              className="cursor-pointer self-end -translate-y-5 -translate-x-1"
            />
            <Label htmlFor="confirmPassword" label="confirmPassword" />
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={errors.confirmPassword?.message || ''}
              register={register}
              fieldName="confirmPassword"
            />
            <Image
              src={showConfirmPassword ? visibleIcon : hiddenIcon}
              width={15}
              height={15}
              alt="eye"
              onClick={toggleConfirmPasswordVisibiity}
              className="cursor-pointer self-end -translate-y-5 -translate-x-1"
            />
          </div>
          <button className="mt-3 w-full h-fit border border-black font-medium">
            login
          </button>
        </form>
      </div>
    </section>
  );
}
