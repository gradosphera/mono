import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('union_chats')
export class UnionChatTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'coop_username' })
  coopUsername!: string;

  @Column({ name: 'matrix_user_id' })
  matrixUserId!: string;

  @Column({ name: 'room_id' })
  roomId!: string;

  @Column({ name: 'union_person_id' })
  unionPersonId!: string;

  @Column({ name: 'union_name' })
  unionName!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
