import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRentalDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  kendaraanId: number;
}
