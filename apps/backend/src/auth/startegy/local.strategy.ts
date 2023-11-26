import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
// import { AuthService } from '../auth.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
  ) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string): Promise<User> {
    console.log('hello from validate func');
    try {
      const user = await this.authService.verifyUser(email, password);
      if (!user) {
        throw new UnauthorizedException(
          'Access denied: incorrect email or password',
        );
      }
      return user;
    } catch (err) {
      throw err;
    }
  }
}
