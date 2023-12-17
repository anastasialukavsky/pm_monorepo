import {
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../types/index';

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   private readonly logger = new Logger(AuthMiddleware.name);

//   // constructor(private readonly requestService: RequestService) {}

//   constructor(
//     private readonly authService: AuthService,
//     private jwt: JwtService,
//   ) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     this.logger.log(AuthMiddleware.name);

//     const authToken = req.headers['authorization'];

//     if (!authToken) {
//       return res
//         .status(401)
//         .json({ message: 'Unauthorized - Missing Authorization Header' });
//     }

//     try {
//       const decodedAT = this.jwt.decode(authToken);
//       if (!this.authService.isAccessTokenValid(decodedAT)) {
//         const refreshToken = req.headers['refresh_token'];
//         if (!refreshToken) {
//           return res
//             .status(401)
//             .json({ message: 'Unauthorized - missing Refresh Token' });
//         }
//         const userId = decodedAT.sub;
//         const newTokens: Tokens = await this.authService.refreshTokens(
//           userId,
//           refreshToken,
//         );
//         res.setHeader('access_token', newTokens.access_token);
//         res.setHeader('refresh_token', newTokens.refresh_token);
//         next();
//       }
//     } catch (err) {
//       this.logger.error(`Authentication error: ${err.message}`);
//       return res.status(401).json({
//         message: 'Unauthorize',
//       });
//     }

//     next();
//   }
// }

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // const authToken = req.headers['authorization'];
    // console.log('hello from middleware');

    // console.log('req headers', req.headers);
    // console.log('REQ Cookies from middleware: ', req.cookies);
    // if (!authToken)
    //   throw new UnauthorizedException('Unauthorized - Invalid Token');

    // const userId = await this.authService.checkUserAuth(
    //   req.headers as Record<string, string>,
    // );

    // if (!userId)
    //   throw new UnauthorizedException('Unauthorized - Invalid Token Sub');

    // req.user = userId;

    const access_token = req.cookies.access_token;

    console.log('hilo form middleware');

    if (!access_token)
      throw new UnauthorizedException('Unauthorized - Invalid Access Token');

    const userId = req.cookies.userId;
    console.log({ 'userId from middleware': userId });

    if (!userId)
      throw new UnauthorizedException('Unauthorized- Invalid Token Sub');

    req.user = userId;
    next();
  }
}
