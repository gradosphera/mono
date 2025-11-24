import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('matrix_users')
export class MatrixUserTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'coop_username', unique: true })
  coopUsername!: string;

  @Column({ name: 'matrix_user_id' })
  matrixUserId!: string;

  @Column({ name: 'matrix_username' })
  matrixUsername!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
