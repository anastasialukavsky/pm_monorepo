import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('GOOGLE_CLIENT_ID'),
      clientSecret: config.get('GOOGLE_SECRET'),
      callbackURL: 'http://localhost:3333/auth/google/redirect/',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _access_token: string,
    _refresh_token: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { email, firstName, lastName } = profile;
      const user = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        _access_token,
      };
      done(null, user);
      // return user;
    } catch (err) {
      done(err, false);
    }
  }
}
