import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
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
  use(req: Request, res: Response, next: NextFunction) {
    const authToken = req.headers['authorization'];
    console.log('hello from middleware');
    // if (!authToken) {
    //   return res
    //     .status(401)
    //     .json({ message: 'Unauthorized - Missing Authorization Header' });
    // } else {
    console.log('REQUSR', req.user);
    return req.user;

    next();
  }
}
