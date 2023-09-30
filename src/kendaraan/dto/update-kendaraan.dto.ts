import { PartialType } from '@nestjs/mapped-types';
import { CreateKendaraanDto } from './create-kendaraan.dto';

export class UpdateKendaraanDto extends PartialType(CreateKendaraanDto) {}
