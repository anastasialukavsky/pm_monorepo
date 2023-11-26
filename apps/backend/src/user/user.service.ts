import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from './dto';
import { exclude } from 'utils.exlude-pass';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // hello() {
  //   return {
  //     message: 'hello',
  //   };
  // }

  async getUser(email: string, password: string) {
    console.log('hello from getUser');
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user)
        throw new NotFoundException(`User with email ${email} is not found`);
      const matchHash = await argon.verify(password, user.password);

      if (user && matchHash) {
        return {
          userId: user.id,
        };
      }

      return null;
    } catch (err) {
      throw err;
    }
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user || userId !== user.id)
      throw new ForbiddenException('Access denied: user does not exist');

    const userWithoutPassword = exclude(user, ['password']);

    return userWithoutPassword;
  }

  async editUser(userId: string, dto: EditUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user)
      throw new ForbiddenException(
        `Access denied: user with ID ${userId} does not exist`,
      );
    const userToUpdate = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    const userWithoutPassword = exclude(userToUpdate, ['password']);

    return userWithoutPassword;
  }
}
