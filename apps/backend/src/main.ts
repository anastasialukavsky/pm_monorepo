import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = (await NestFactory.create(AppModule, {
    bufferLogs: true,
    abortOnError: false,
  }).catch(console.error)) as INestApplication;

  const SESSION_SECRET = process.env.SESSION_SECRET;

  if (!SESSION_SECRET)
    throw new NotFoundException('Cannot extract session secret');
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true, // Allow credentials (cookies, headers, etc.)
  });
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(cookieParser());

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(3333);
}
bootstrap();
