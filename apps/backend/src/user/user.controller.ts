import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
// import { User } from '@prisma/client';
// import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
import { GetUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // @Get('hello')
  // hello() {
  //   return this.userService.hello();
  // }
  @Get()
  getUser(email: string, password: string) {
    return this.userService.getUser(email, password);
  }
  @Get(':id')
  getUserById(@GetUser('id') userId: string) {
    return this.userService.getUserById(userId);
  }

  @Patch(':id')
  editUser(@GetUser('id') userId: string, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
