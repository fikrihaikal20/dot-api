import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Status } from '../entities/kendaraan.entity';

export class CreateKendaraanDto {
  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsInt()
  year: number;

  @IsNotEmpty()
  @IsString()
  platNomor: string;

  @IsOptional()
  @IsEnum(Status)
  status: Status;
}
