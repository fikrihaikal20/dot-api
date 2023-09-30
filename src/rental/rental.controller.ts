import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { RentalService } from './rental.service';
import { CreateRentalDto } from './dto/create-rental.dto';

@Controller('rental')
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @Post()
  async create(@Body() createRentalDto: CreateRentalDto) {
    const created = await this.rentalService.create(createRentalDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'create rental successfully',
      data: created,
    };
  }

  @Get()
  async findAll() {
    const getAll = await this.rentalService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Get all rental successfully',
      data: getAll,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const getOne = await this.rentalService.findOne(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Get One rental successfully',
      data: getOne,
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rentalService.remove(+id);
  }
}
