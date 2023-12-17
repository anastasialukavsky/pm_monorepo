import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  // UnauthorizedException,
  // Res,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, LoginDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
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
import { createClient } from 'redis';
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
      //saving at and rt into  a cache storage for future use
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

  // async refreshTokens(userId: string, refresh_token: string) {
  //   try {
  //     const user = await this.prisma.user.findUnique({
  //       where: {
  //         id: userId,
  //       },
  //     });

  //     if (!user)
  //       throw new ForbiddenException(
  //         `Access Denied: User with id ${userId} is not found`,
  //       );

  //     const cachedTokens = await this.getCachedTokens(user.id, user.email);

  //     // const isCachedATValid = await this.isAccessTokenValid(
  //     //   cachedTokens.access_token,
  //     // );

  //     // if (!cachedTokens) {
  //     // }

  //     console.log({ cachedTokens });
  //   } catch (err) {
  //     throw err;
  //   }

  //   //take a userId fro the redis and verify that both userId matches
  //   //generate a new pair of tokens
  //   //save them to redis cache
  //   //return new signed tokens
  // }

  async getCachedTokens(userId: string, email: string) {
    const tokens = await this.signToken(userId, email);
    try {
      const strTokens = JSON.stringify(tokens);
      await this.cacheService.set(userId, strTokens);
      const cachedStrTokens: string | null =
        await this.cacheService.get(userId);

      if (cachedStrTokens) {
        const cachedTokens: Tokens = JSON.parse(cachedStrTokens);
        // console.log({ cachedTokens });
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

  async getUserCachedTokens(userId: string): Promise<Tokens | null> {
    try {
      const cachedTokensStr: string | null =
        await this.cacheService.get(userId);
      if (!cachedTokensStr) {
        console.error(`No tokens for userId ${userId} found in cache`);
        return null;
      }

      const cachedTokens: Tokens = JSON.parse(cachedTokensStr);

      return cachedTokens;
    } catch (err) {
      console.error('Error retrieving tokens from cache: ', err);
      return null;
    }
  }

  async getRedisKey(userId: string): Promise<string[]> {
    const client = (this.cacheService.store as any).client as ReturnType<
      typeof createClient
    >;

    return new Promise<string[]>((resolve, reject) => {
      client.keys(userId, (err, keys) => {
        if (err) {
          reject(err);
        } else {
          resolve(keys);
        }
      });
    });
  }

  async isAccessTokenValid(access_token: string): Promise<boolean> {
    const decodedAT = this.jwt.decode(access_token) as { exp: number };
    const currentTime = Math.floor(Date.now() / 1000);

    const tokenExpiration = decodedAT.exp;

    return tokenExpiration > currentTime;
  }

  private async rotateTokens(
    userId: string,
    refresh_token: string,
  ): Promise<Tokens> {
    const REFRESH_SECRET = this.config.get('REFRESH_JWT_SECRET');
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user)
        throw new ForbiddenException('Access Denied, user does not exist');
      // const redisUserId = await this.getRedisKey(userId);
      const cachedTokens = await this.getCachedTokens(user.id, user.email);
      const isCachedATValid = await this.isAccessTokenValid(
        cachedTokens.access_token,
      );

      if (isCachedATValid) return cachedTokens;
      const rtMatches = await this.jwt.verify(refresh_token, REFRESH_SECRET);

      if (!rtMatches) throw new ForbiddenException('Access Denied');

      const newTokens = await this.signToken(user.id, user.email);
      await this.cacheService.set(userId, JSON.stringify(newTokens));

      // return {
      //   access_token: newTokens.access_token,
      //   refresh_token: newTokens.refresh_token,
      // };

      return newTokens;
      // if (redisUserId === userId) {
      // }
      // const newTokens = await this.refreshTokens(userId, refresh_token);

      // return newTokens;

      //take a userId fro the redis and verify that both userId matches
      //generate a new pair of tokens
      //save them to redis cache
      //return new signed tokens
    } catch (err) {
      throw err;
    }
  }

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

  async checkUserAuth(headers: Record<string, string>): Promise<string | null> {
    try {
      const authToken = headers['authorization'];

      console.log({ headers });
      console.log({ authToken });
      if (!authToken || !authToken.startsWith('Bearer ')) {
        console.error('Access denied -authorization token not found');
        return null;
      }

      const tokenWithoutBearer = authToken.substring('Bearer '.length);

      const decodedAT = this.jwt.decode(tokenWithoutBearer) as {
        sub: string;
        exp: number;
      };

      console.log('Decoded Access Token:', decodedAT);

      if (!decodedAT || this.isTokenExpired(decodedAT.exp)) {
        const refreshToken = headers['refresh_token'];

        if (!refreshToken) {
          console.error('No refresh token found');
          return null;
        }

        const userId = decodedAT.sub;

        console.log('Refreshing tokens for user:', userId);

        const newTokens = await this.rotateTokens(userId, refreshToken);

        await this.cacheService.set(userId, JSON.stringify(newTokens));

        console.log('Tokens refreshed for user:', userId);

        return userId; // User is authenticated with refreshed tokens
      }

      console.log('User is authenticated with valid tokens');
      return decodedAT.sub; // User is authenticated with valid tokens
    } catch (err) {
      console.error('Error during authentication:', err);
      return null;
    }
  }

  private isTokenExpired(expiration: number): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return expiration < currentTime;
  }
}
