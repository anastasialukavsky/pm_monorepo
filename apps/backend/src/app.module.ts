import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
// import { BookmarkService } from './bookmark/bookmark.service';
// import { BookmarkController } from './bookmark/bookmark.controller';
import { BookmarkModule } from './bookmark/bookmark.module';
// import { ProjectController } from './project/project.controller';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    BookmarkModule,
    ProjectModule,
    TaskModule,
  ],
  // controllers: [ProjectController],
})
export class AppModule {}
