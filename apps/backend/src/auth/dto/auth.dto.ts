import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(2)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(2)
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 28)
  password: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 28)
  password: string;
}
