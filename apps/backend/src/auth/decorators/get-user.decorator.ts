import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator(
  <K extends keyof User>(data: K, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (request && request.user) {
      const user = request.user as User;
      return user[data];
    }
    return undefined;
  },
);
