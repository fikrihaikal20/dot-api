import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    const getAll = await this.userService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Get all user successfully',
      data: getAll,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const getOne = await this.userService.findOnebyId(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Get One User successfully',
      data: getOne,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
}
