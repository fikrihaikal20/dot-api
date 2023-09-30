import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { KendaraanService } from './kendaraan.service';
import { CreateKendaraanDto } from './dto/create-kendaraan.dto';
import { UpdateKendaraanDto } from './dto/update-kendaraan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { hasRoles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kendaraan')
export class KendaraanController {
  constructor(private readonly kendaraanService: KendaraanService) {}

  @Post()
  @hasRoles('admin')
  create(@Body() createKendaraanDto: CreateKendaraanDto) {
    return this.kendaraanService.create(createKendaraanDto);
  }

  @Get()
  async findAll() {
    const getAll = await this.kendaraanService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Get all kendaraan successfully',
      data: getAll,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const getOne = await this.kendaraanService.findOne(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Get one kendaraan successfully',
      data: getOne,
    };
  }

  @Patch(':id')
  @hasRoles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateKendaraanDto: UpdateKendaraanDto,
  ) {
    const updated = await this.kendaraanService.update(+id, updateKendaraanDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Kendaraan Updated successfully',
      data: updated,
    };
  }
}
