import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
// import { BookmarkService } from './bookmark/bookmark.service';
// import { BookmarkController } from './bookmark/bookmark.controller';
// import { ProjectController } from './project/project.controller';
import { BookmarkModule } from './bookmark/bookmark.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { AuthMiddleware } from './auth/middleware';
// import { CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
// import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
// import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { createClient } from 'redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      client: createClient(),
    }),
    JwtModule.register({}),
    AuthModule,
    UserModule,
    PrismaModule,
    BookmarkModule,
    ProjectModule,
    TaskModule,
  ],
  providers: [AppService, AuthService],
  // controllers: [ProjectController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('authentication-check');
  }
}
