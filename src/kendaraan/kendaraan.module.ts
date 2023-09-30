import { Module } from '@nestjs/common';
import { KendaraanService } from './kendaraan.service';
import { KendaraanController } from './kendaraan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kendaraan } from './entities/kendaraan.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Kendaraan]), UserModule],
  controllers: [KendaraanController],
  providers: [KendaraanService],
  exports: [KendaraanService, TypeOrmModule],
})
export class KendaraanModule {}
