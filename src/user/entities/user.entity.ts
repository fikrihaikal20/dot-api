import { Rental } from '../../rental/entities/rental.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ unique: true })
  email: string;

  @Column()
  alamat: string;

  @Column()
  password: string;

  @Column({ type: 'text', nullable: true })
  refresh_token: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => Rental, (rental) => rental.user)
  rentals: Rental[];

  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSaltSync();
    this.password = await bcrypt.hashSync(this.password, salt);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
