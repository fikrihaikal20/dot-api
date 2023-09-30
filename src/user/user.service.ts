import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll() {
    return this.usersRepository.find({
      select: {
        id: true,
        nama: true,
        email: true,
        alamat: true,
        role: true,
      },
    });
  }

  findOnebyId(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        nama: true,
        email: true,
        alamat: true,
        role: true,
      },
    });
  }

  findOnebyEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async checkRole(id: number, roles: string[]) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    for (const role of roles) {
      if (user.role === role) {
        return true;
      }
    }
    return false;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    if (updateUserDto.nama) {
      user.nama = updateUserDto.nama;
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.alamat) {
      user.alamat = updateUserDto.alamat;
    }
    if (updateUserDto.refresh_token) {
      user.refresh_token = updateUserDto.refresh_token;
    }

    this.usersRepository.save(user);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated',
    };
  }
}
