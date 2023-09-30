import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/user/entities/user.entity';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

import { Tokens } from 'src/auth/types/tokens.type';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository;

  const userDto: CreateUserDto = {
    nama: 'tes',
    email: 'test@gmail.com',
    password: 'password',
    alamat: null,
    refresh_token: null,
  };

  let tokens: Tokens;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    const newUser = userRepository.create({
      nama: userDto.nama,
      email: userDto.email,
      password: userDto.password,
    });
    await userRepository.save(newUser);
  });

  afterAll(async () => {
    await userRepository.delete({ email: userDto.email });
    await app.close();
  });

  describe('Auth', () => {
    describe('POST /auth/register', () => {
      it('should return 400 if name is missing', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: userDto.email,
            password: userDto.password,
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Bad Request');
      });

      it('should return 400 if email is missing', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            nama: userDto.email,
            password: userDto.password,
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Bad Request');
      });

      it('should return 400 if password is missing', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            nama: userDto.email,
            email: userDto.email,
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error', 'Bad Request');
      });

      it('should return 409 if email already exists', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userDto);
        expect(res.statusCode).toEqual(409);
        expect(res.body).toHaveProperty('message', 'User already exists');
      });

      it('should return 201 if user is created', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            nama: 'fikri',
            email: 'fikri@gmail.com',
            password: 'password',
          });
        expect(res.statusCode).toEqual(201);
        expect(res.body.data.nama).toBeDefined();
        expect(res.body.data.email).toBeDefined();
      });
    });

    describe('POST /auth/login', () => {
      it('should return 400 if user not found', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'unknown@example.com',
            password: 'password',
          });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'User not found');
      });

      it('should return 400 if password does not match', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: userDto.email,
            password: 'wrongpassword',
          });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Incorrect Password');
      });

      it('should return access token and set refresh token', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: userDto.email,
            password: userDto.password,
          });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Login Success');
        expect(res.body.data.token).toBeDefined();

        tokens = res.body.data.token;
      });
    });

    describe('POST /auth/token', () => {
      it('should return 401 if invalid refresh_token ', async () => {
        const res = await request(app.getHttpServer())
          .get('/auth/token')
          .auth('invalid_refresh_token', {
            type: 'bearer',
          });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Unauthorized');
      });

      it('should return refresh tokens and access token', async () => {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(true);
          }, 1000);
        });

        const res = await request(app.getHttpServer())
          .get('/auth/token')
          .auth(tokens.refresh_token, {
            type: 'bearer',
          });

        const access_token: Tokens = res.body.data.token.access_token;
        const refresh_token: Tokens = res.body.data.token.refresh_token;

        expect(res.statusCode).toEqual(200);
        expect(access_token).toBeDefined();
        expect(refresh_token).toBeDefined();

        expect(refresh_token).not.toBe(tokens.access_token);
        expect(refresh_token).not.toBe(tokens.refresh_token);
      });
    });
  });
});
