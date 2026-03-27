import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CHATCOOP_STATE_SINGLETON_ID } from '../../domain/chatcoop-state.constants';

@Entity('chatcoop_state')
export class ChatcoopStateTypeormEntity {
  @PrimaryColumn({ type: 'varchar', length: 36, default: CHATCOOP_STATE_SINGLETON_ID })
  id!: string;

  @Column({ name: 'space_id', type: 'varchar', length: 255, nullable: true })
  spaceId!: string | null;

  @Column({ name: 'is_initialized', type: 'boolean', default: false })
  isInitialized!: boolean;

  @Column({ name: 'secretary_matrix_user_id', type: 'varchar', length: 255, nullable: true })
  secretaryMatrixUserId!: string | null;

  @Column({ name: 'secretary_initialized', type: 'boolean', default: false })
  secretaryInitialized!: boolean;

  @Column({ name: 'secretary_username', type: 'varchar', length: 255, nullable: true })
  secretaryUsername!: string | null;

  @Column({ name: 'secretary_password_encrypted', type: 'text', nullable: true })
  secretaryPasswordEncrypted!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
