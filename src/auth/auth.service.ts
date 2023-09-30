import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './types/jwtPayload.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private config: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOnebyEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    if (await user.validatePassword(password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async create(createUserDto: CreateUserDto) {
    const user = new User();
    const find = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (find) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    user.nama = createUserDto.nama;
    user.email = createUserDto.email;
    user.password = createUserDto.password;

    const savedUser = await this.usersRepository.save(user);

    return {
      nama: savedUser.nama,
      email: savedUser.email,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );
    if (!user) {
      throw new HttpException('Incorrect Password', HttpStatus.UNAUTHORIZED);
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login Success',
      data: {
        token: tokens,
      },
    };
  }

  async refreshTokens(userId: number, rt: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!user || !user.refresh_token) {
        throw new ForbiddenException('Access Denied');
      }

      const rtMatches = bcrypt.compareSync(rt, user.refresh_token);
      if (!rtMatches) throw new ForbiddenException('Access Denied');

      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRtHash(user.id, tokens.refresh_token);

      return {
        statusCode: HttpStatus.OK,
        message: 'Get Refresh Token Success',
        data: {
          token: tokens,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error',
        error.message,
      );
    }
  }

  async logout(userId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user || !user.refresh_token) {
      throw new ForbiddenException('Access Denied');
    }
    user.refresh_token = null;

    await this.usersRepository.save(user);
  }

  async updateRtHash(userId: number, rt: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rt, salt);
    await this.usersService.update(userId, { refresh_token: hashedPassword });
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
