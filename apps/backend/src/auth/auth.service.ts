import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  // Res,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, LoginDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// import { Tokens } from './types/index';
import { exclude } from 'utils.exlude-pass';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
// import { cachedDataVersionTag } from 'v8';
import { Tokens } from './types/index';
// import { HttpService } from '@nestjs/axios';

@Injectable({})
export class AuthService {
  constructor(
    private user: UserService,
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    // private readonly httpService: HttpService,
  ) {}

  googleLogin(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
  ) {
    if (!req.user) throw new ForbiddenException('No user returned from Google');

    return {
      message: 'User information from google recieved',
      user: req.user,
    };
  }

  //*user is already in db and his google account was connected to account in our app
  //*user is already in db, but his google account wasn't connected yet to account in our app
  //*user doesn't exist in db

  async login(dto: LoginDto) {
    try {
      console.log('Start login process');

      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      console.log('User found:', user);

      if (!user)
        throw new NotFoundException(
          `Access denied: user with email ${dto.email} does not exist`,
        );

      console.log('Comparing passwords');

      const comparePassword = await argon.verify(user.password, dto.password);

      console.log('Password comparison done');

      if (!comparePassword)
        throw new ForbiddenException('Access denied: Incorrect password');

      // const tokens = await this.signToken(user.id, user.email);
      // const cacheTokens = await this.cacheService.set(user.id, tokens);

      // const cachedData = await this.cacheService.get(user.id);

      // if (cachedData) {
      //   console.log({ cachedData });
      // }
      // console.log(cacheTokens);
      const tokens = await this.signToken(user.id, user.email);
      //saving at and rt into  a cache storage forfuture use
      await this.cacheService.set(user.id, tokens);

      console.log('Login process completed');

      return {
        id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      };
    } catch (err) {
      throw err;
    }
  }

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      const tokens = await this.signToken(user.id, user.email);
      //saving at and rt into  a cache storage forfuture use
      await this.cacheService.set(user.id, tokens);

      return {
        id: user.id,
        token: tokens.access_token,
        refreshToken: tokens.refresh_token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002')
          throw new ForbiddenException(`Email ${dto.email} already exists`);
      }
      throw err;
    }
  }

  async logout(userId: string) {
    try {
      const userToLogout = await this.prisma.user.update({
        where: {
          id: userId,
          hashedRt: {
            not: null,
          },
        },
        data: {
          hashedRt: null,
        },
      });

      const userWithoutPassword = exclude(userToLogout, ['password']);
      return userWithoutPassword;
    } catch (err) {
      throw err;
    }
  }

  async refreshToken(userId: string, rt: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user)
      throw new ForbiddenException('Access denied: token hash does not match');

    if (user.hashedRt) {
      const matchHash = await argon.verify(rt, user.hashedRt);
      if (!matchHash)
        throw new ForbiddenException('Access denied: hash does not match');
    }

    const tokens = await this.signToken(userId, user.email);
    // await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async getCachedTokens(userId: string, email: string) {
    const tokens = await this.signToken(userId, email);
    try {
      const strTokens = JSON.stringify(tokens);
      await this.cacheService.set(userId, strTokens);
      const cachedStrTokens: string | null =
        await this.cacheService.get(userId);

      if (cachedStrTokens) {
        const cachedTokens: Tokens = JSON.parse(cachedStrTokens);
        console.log({ cachedTokens });
        return cachedTokens;
      } else {
        throw new Error('No tokens found in cache');
      }

      // return {
      //   access_token: cachedTokens.access_token,
      //   refresh_token: cachedTokens.refresh_token,
      // };
    } catch (err) {
      throw err;
    }
  }

  private isAccessTokenValid(access_token: string): boolean {
    const decodedAT = this.jwt.decode(access_token) as { exp: number };
    const currentTime = Math.floor(Date.now() / 1000);

    const tokenExpiration = decodedAT.exp;

    return tokenExpiration > currentTime;
  }

  private rotateTokens() {}

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const SECRET = this.config.get('JWT_SECRET');
    const REFRESH_SECRET = this.config.get('REFRESH_JWT_SECRET');

    const [token, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: 60 * 1, //15
        secret: SECRET,
      }),

      this.jwt.signAsync(payload, {
        expiresIn: 60 * 60 * 24 * 7, //keep it to a day?
        secret: REFRESH_SECRET,
      }),
    ]);

    return {
      access_token: token,
      refresh_token: refreshToken,
    };
  }

  async verifyUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (user && user.email !== email && user.password !== password)
        return null;
      // throw new UnauthorizedException('Access denied: invalid credentials');

      return user;
    } catch (err) {
      throw err;
    }
  }

  async getUserEmail(email: string) {
    try {
      const emailCheck = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!emailCheck) return { status: 404, message: false };

      return { status: 200, message: true };
    } catch (err) {
      throw err;
    }
  }

  async checkUserAuth(headers: Record<string, string>): Promise<boolean> {
    const token = headers.cookie['access_token'];
    // console.log(headers);
    if (!token) {
      return false;
    }
    console.log({ headers });
    // const extractedToken = token.split(' ')[1];

    try {
      const SECRET = this.config.get('JWT_SECRET');
      const verifyOptions: JwtVerifyOptions = {
        secret: SECRET,
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const decodedToken = this.jwt.verify(token, verifyOptions);

      return true;
    } catch (err) {
      console.log(err);

      if (err.name === 'TokenExpiredError') {
        console.log('Token expired');
        const rt = headers.cookie['refresh_token'];
        // const hash = await argon.hash(rt);
        if (rt) {
          const user = await this.prisma.user.findFirst({
            where: {
              id: headers.cookie['userId'],
            },
          });

          try {
            if (user.hashedRt !== rt) {
              throw new Error('Access denied, rt do not match');
            }

            return true;
          } catch (refreshErr) {
            console.log({ refreshErr });
          }
        }
      }

      return false;
    }
  }
}
