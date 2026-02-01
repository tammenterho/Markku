import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('campaigns') // tietokantataulun nimi
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string; // automaattisesti generoitu UUID

  @Column({ type: 'varchar', length: 255 })
  clientId: string;

  @Column({ type: 'varchar', length: 255 })
  companyId: string;

  @Column({ type: 'varchar', length: 255 })
  company: string;

  @Column({ type: 'varchar', length: 255 })
  customer: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payer: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  copyText: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  targetAge: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  targetGender: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetArea: string;

  @Column({ type: 'numeric', default: 0 })
  budget: number;

  @Column({ type: 'varchar', length: 255 })
  budgetPeriod: string;

  @Column({ type: 'varchar', length: 255 })
  mediaInfo: string;

  @Column({ type: 'timestamp', nullable: true })
  start: Date;

  @Column({ type: 'timestamp', nullable: true })
  end: Date;

  @Column({ default: false })
  status: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  cta: string;

  @Column({ name: 'createdBy', type: 'varchar', length: 255 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
