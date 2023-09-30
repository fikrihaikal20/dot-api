import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRentalDto } from './dto/create-rental.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental } from './entities/rental.entity';
import { UserService } from '../user/user.service';
import { KendaraanService } from '../kendaraan/kendaraan.service';
import { Status } from '../kendaraan/entities/kendaraan.entity';

@Injectable()
export class RentalService {
  constructor(
    private usersService: UserService,
    private kendaraanService: KendaraanService,
    @InjectRepository(Rental)
    private readonly RentalRepository: Repository<Rental>,
  ) {}

  async create(createRentalDto: CreateRentalDto) {
    const rental = new Rental();

    const user = await this.usersService.findOnebyId(createRentalDto.userId);
    const kendaraan = await this.kendaraanService.findOne(
      createRentalDto.kendaraanId,
    );

    const existingRental = await this.RentalRepository.findOne({
      where: {
        user: { id: createRentalDto.userId },
        kendaraan: { id: createRentalDto.kendaraanId },
      },
    });

    if (!user) {
      throw new HttpException(`user not found`, HttpStatus.NOT_FOUND);
    }
    if (!kendaraan) {
      throw new HttpException(`kendaraan not found`, HttpStatus.NOT_FOUND);
    }
    if (kendaraan.status == Status.Dipakai) {
      throw new HttpException(`kendaraan not available`, HttpStatus.NOT_FOUND);
    }

    if (existingRental) {
      throw new HttpException(
        `Rental with the same user and kendaraan already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }

    rental.kendaraan = kendaraan;
    rental.user = user;
    rental.startDate = createRentalDto.startDate;
    rental.endDate = createRentalDto.endDate;

    await this.kendaraanService.update(kendaraan.id, {
      status: Status.Dipakai,
    });

    return this.RentalRepository.save(rental);
  }

  async findAll() {
    return this.RentalRepository.find({
      relations: ['kendaraan', 'user'],
      select: {
        kendaraan: {
          id: true,
          brand: true,
          model: true,
          platNomor: true,
          status: true,
          year: true,
        },
        user: {
          id: true,
          nama: true,
          alamat: true,
          email: true,
          role: true,
        },
      },
    });
  }

  async findOne(id: number) {
    const rental = await this.RentalRepository.findOne({
      where: { id },
      relations: ['kendaraan', 'user'],
      select: {
        kendaraan: {
          id: true,
          brand: true,
          model: true,
          platNomor: true,
          status: true,
          year: true,
        },
        user: {
          id: true,
          nama: true,
          alamat: true,
          email: true,
          role: true,
        },
      },
    });
    if (!rental) {
      throw new HttpException('rental not found', HttpStatus.NOT_FOUND);
    }
    return rental;
  }

  async remove(id: number) {
    const rental = await this.RentalRepository.findOne({
      where: { id },
      relations: ['kendaraan'],
      select: {
        kendaraan: {
          id: true,
        },
      },
    });
    if (!rental) {
      throw new HttpException('rental not found', HttpStatus.NOT_FOUND);
    }

    this.kendaraanService.update(rental.kendaraan.id, {
      status: Status.Tersedia,
    });

    const removed = await this.RentalRepository.remove(rental);
    return {
      statusCode: HttpStatus.OK,
      message: 'Delete rental success',
      data: removed,
    };
  }
}
