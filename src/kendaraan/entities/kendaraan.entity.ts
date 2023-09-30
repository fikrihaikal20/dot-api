import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Rental } from '../../rental/entities/rental.entity';

export enum Status {
  Tersedia = 'tersedia',
  Dipakai = 'dipakai',
}

@Entity()
export class Kendaraan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ unique: true })
  platNomor: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.Tersedia,
  })
  status: Status;

  @OneToMany(() => Rental, (rental) => rental.kendaraan)
  rentals: Rental[];
}
