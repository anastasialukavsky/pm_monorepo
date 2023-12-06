import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

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

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  // constructor(private readonly requestService: RequestService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(AuthMiddleware.name);

    const authToken = req.headers['authorization'];

    if (!authToken) {
      return res
        .status(401)
        .json({ message: 'Unauthorized - Missing Authorization Header' });
    }

    next();
  }
}
