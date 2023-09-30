import { Module } from '@nestjs/common';
import { RentalService } from './rental.service';
import { RentalController } from './rental.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rental } from './entities/rental.entity';
import { UserModule } from '../user/user.module';
import { KendaraanModule } from '../kendaraan/kendaraan.module';

@Module({
  imports: [UserModule, KendaraanModule, TypeOrmModule.forFeature([Rental])],
  controllers: [RentalController],
  providers: [RentalService],
})
export class RentalModule {}
