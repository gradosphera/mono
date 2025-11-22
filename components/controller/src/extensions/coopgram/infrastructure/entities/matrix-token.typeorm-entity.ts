import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('matrix_tokens')
export class MatrixTokenTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'coop_username' })
  coopUsername!: string;

  @Column({ name: 'matrix_user_id' })
  matrixUserId!: string;

  @Column({ unique: true })
  token!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'is_used', default: false })
  isUsed!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
