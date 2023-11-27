import { ZodType, z } from 'zod';
import { LoginFormData, SignUpFormData } from './_types';

const regexUpperCase = /[A-Z]/;
const regexSpecialChars = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;

export const zodLogin: ZodType<LoginFormData> = z
  .object({
    email: z.string().email({ message: 'please enter a valid e-mail address' }),
    password: z
      .string()
      .min(10, { message: 'should be at least 10 characters' })
      .max(28, { message: 'should be at most 28 characters' }),
  })
  .strict();

export const zodPasswordSchema = z
  .string()
  .min(10, { message: 'should be at least 10 characters' })
  .max(28, { message: 'should be at most 28 characters' })
  .refine((value) => regexUpperCase.test(value), {
    message: 'should contain at least 2 uppercase letters',
  })
  .refine((value) => regexSpecialChars.test(value), {
    message: 'should contain at least 2 special characters',
  });

export const zodSignup: ZodType<SignUpFormData> = z
  .object({
    firstName: z
      .string()
      .min(2, { message: 'should be at least 2 characters' }),
    lastName: z.string().min(2, { message: 'should be at least 2 characters' }),
    email: z.string().email({ message: 'please enter valid e-mail address' }),
    password: zodPasswordSchema,
    confirmPassword: z.string(),
  })
  .strict()
  .refine(
    ({ password, confirmPassword }) => {
      return password === confirmPassword;
    },
    {
      message: 'Password fields do not match.',
      path: ['confirmPassword'],
    },
  );
