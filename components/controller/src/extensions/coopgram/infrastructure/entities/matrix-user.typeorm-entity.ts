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

  @Column({ name: 'matrix_access_token' })
  matrixAccessToken!: string;

  @Column({ name: 'matrix_device_id' })
  matrixDeviceId!: string;

  @Column({ name: 'matrix_home_server' })
  matrixHomeServer!: string;

  @Column({ name: 'is_registered', default: false })
  isRegistered!: boolean;

  @Column({ name: 'last_token_refresh', type: 'timestamp' })
  lastTokenRefresh!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
