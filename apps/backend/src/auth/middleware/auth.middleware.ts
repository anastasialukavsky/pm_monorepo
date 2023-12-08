import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  // constructor(private readonly requestService: RequestService) {}

  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(AuthMiddleware.name);

    const authToken = req.headers['authorization'];

    if (!authToken) {
      return res
        .status(401)
        .json({ message: 'Unauthorized - Missing Authorization Header' });
    }

    try {
      // const decodedAT =
    } catch (err) {
      throw err;
    }

    next();
  }
}

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {

//     const authToken = req.headers['authorization'];

//     if (!authToken) {
//       return res
//         .status(401)
//         .json({ message: 'Unauthorized - Missing Authorization Header' });
//     }

//     next();
//   }
// }
