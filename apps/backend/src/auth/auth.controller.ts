import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  // Headers,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, LoginDto } from './dto';
import { Request } from 'express';
import { GoogleGuard, JwtGuard, LocalAuthGuard } from './guard';
import { GetUser } from './decorators';
// import { GetUserId } from './decorators/get-user-id.decorator';

import { Response } from 'express';
import { Tokens } from './types/index';

//*POST /api/auth/signup
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('save-to-redis')
  async saveToRediss(@Body() data: { key: string; value: string }) {
    const { key, value } = data;
    await this.authService.getCachedTokens(key, value);
  }

  @UseGuards(GoogleGuard)
  @Get('google')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async signInWithGoogle(@Req() req: Request) {}

  @UseGuards(GoogleGuard)
  @Get('google/redirect')
  googleAuthRedirect(@Req() req: Request) {
    return this.authService.googleLogin(req);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: AuthDto, @Res() res: Response) {
    const {
      id,
      token,
      refreshToken,
      user: { firstName, lastName, email },
    } = await this.authService.signup(dto);
    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development', //* set to true in production for HTTPS
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
      })
      .cookie('userId', id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development', //* set to true in production for HTTPS
      })
      .send({
        message: 'User successfully signed up',
        userId: id,
        user: { firstName, lastName, email },
      });

    return { id };
    // return this.authService.signup(dto);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const {
      access_token,
      refresh_token,
      user: { userId, firstName, lastName, email },
    } = await this.authService.login(dto);

    res
      .cookie('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development', //* set to true in production for HTTPS
      })
      .cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
      })
      .cookie('userId', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
      })
      .send({
        message: 'User successfully logged in',
        user: { userId, firstName, lastName, email },
      });

    return { userId };
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  // @UseGuards(RtGuard)
  // @Post('refresh')
  // @HttpCode(HttpStatus.OK)
  // refreshToken(
  //   @GetUser('hashedRt') refreshToken: string,
  //   @GetUserId() userId: string,
  // ) {
  //   return this.authService.refreshToken(userId, refreshToken);
  // }

  @Get('authentication-check/:userId')
  async getUserAuthStatus(
    @Req() request: Request,
    @Param('userId') userId: string,
  ) {
    try {
      // const userId = request.params;
      console.log('userId from auth controller', userId);

      if (userId !== request.cookies.sub)
        throw new UnauthorizedException(
          'Access denied - userID does not match',
        );

      const isAuthenticated = await this.authService.checkUserAuth({
        authorization: request.headers['authorization'] as string,
        refresh_token: request.cookies['refresh_token'],
      });
      return { authenticated: isAuthenticated };
    } catch (err) {
      throw err;
    }
  }

  @Get('get-tokens/:userId')
  async getTokens(@Param('userId') userId: string): Promise<Tokens | null> {
    try {
      const tokens = await this.authService.getUserCachedTokens(userId);

      if (!tokens) {
        console.error('No tokens found');
      }
      return tokens;
    } catch (err) {
      console.error('Error getting tokens: ', err);
    }
  }

  @Get('verify-email/:email')
  async getUserEmail(@Param('email') email: string, @Res() res: Response) {
    try {
      const emailLookup = await this.authService.getUserEmail(email);

      if (emailLookup.status === 200) {
        return res
          .status(HttpStatus.OK)
          .json({ message: emailLookup.message, status: emailLookup.status });
      } else if (emailLookup.status === 404) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: emailLookup.message, status: emailLookup.status });
      }
    } catch (err) {
      throw err;
    }
  }
}
