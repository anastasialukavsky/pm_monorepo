import axios from 'axios';
import { zodPasswordSchema } from './_zodTypes';
import { ZodError } from 'zod';

const HTTP_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export async function emailCheck(email: string): Promise<boolean> {
  try {
    const { data } = await axios.get(
      `${HTTP_ENDPOINT}/auth/verify-email/${email}`,
      { withCredentials: true },
    );
    console.log(data);
    if (data.message) return true;
    else return false;
  } catch (err) {
    return false;
    console.error(err);
  }
}

export const isValidPassword = (password: string): boolean => {
  try {
    zodPasswordSchema.parse(password);
    return true;
  } catch (error) {
    if (error instanceof ZodError) {
      return false;
    }
    throw error;
  }
};
