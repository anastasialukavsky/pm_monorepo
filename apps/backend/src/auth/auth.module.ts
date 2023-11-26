import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy, JwtStrategy, RtStrategy } from './startegy';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './startegy/local.strategy';
import { SessionSerializer } from './decorators/session/session.serializer';
// import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    UserModule,
    JwtModule.register({}),
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RtStrategy,
    LocalStrategy,
    GoogleStrategy,
    SessionSerializer,
  ],
})
export class AuthModule {}
