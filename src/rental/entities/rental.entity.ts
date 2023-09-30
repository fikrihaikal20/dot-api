import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Kendaraan } from '../../kendaraan/entities/kendaraan.entity';

@Entity()
@Unique(['user', 'kendaraan'])
export class Rental {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => User, (user) => user.rentals)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Kendaraan, (kendaraan) => kendaraan.rentals)
  @JoinColumn({ name: 'kendaraanId' })
  kendaraan: Kendaraan;
}
