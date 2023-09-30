import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateKendaraanDto } from './dto/create-kendaraan.dto';
import { UpdateKendaraanDto } from './dto/update-kendaraan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kendaraan } from './entities/kendaraan.entity';

@Injectable()
export class KendaraanService {
  constructor(
    @InjectRepository(Kendaraan)
    private readonly KendaraanRepository: Repository<Kendaraan>,
  ) {}

  async create(createKendaraanDto: CreateKendaraanDto) {
    try {
      const kendaraan = new Kendaraan();
      kendaraan.brand = createKendaraanDto.brand;
      kendaraan.model = createKendaraanDto.model;
      kendaraan.platNomor = createKendaraanDto.platNomor;
      kendaraan.year = createKendaraanDto.year;

      const created = await this.KendaraanRepository.save(kendaraan);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Create kendaraan success',
        data: created,
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'This data already exist!',
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    const kendaraan = await this.KendaraanRepository.find();
    if (!kendaraan) {
      throw new HttpException('No kendaraan found', HttpStatus.NOT_FOUND);
    }
    return kendaraan;
  }

  async findOne(id: number) {
    const kendaraan = await this.KendaraanRepository.findOneBy({ id });
    if (!kendaraan) {
      throw new HttpException(
        `kendaraan with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return kendaraan;
  }

  async update(id: number, updateKendaraanDto: UpdateKendaraanDto) {
    const kendaraan = await this.KendaraanRepository.findOneBy({ id });
    if (!kendaraan) {
      throw new HttpException(
        `kendaraan with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (updateKendaraanDto.brand) {
      kendaraan.brand = updateKendaraanDto.brand;
    }
    if (updateKendaraanDto.model) {
      kendaraan.model = updateKendaraanDto.model;
    }
    if (updateKendaraanDto.year) {
      kendaraan.year = updateKendaraanDto.year;
    }
    if (updateKendaraanDto.platNomor) {
      kendaraan.platNomor = updateKendaraanDto.platNomor;
    }
    if (updateKendaraanDto.status) {
      kendaraan.status = updateKendaraanDto.status;
    }

    return this.KendaraanRepository.save(kendaraan);
  }
}
