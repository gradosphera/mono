import { Column, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

export const GITHUB_COMM_MESSAGE_CURSOR_TABLE = 'capital_github_comm_message_cursor';

@Entity(GITHUB_COMM_MESSAGE_CURSOR_TABLE)
@Unique('uq_capital_github_comm_msg_cursor', ['coopname', 'matrixRoomId'])
export class GithubCommMessageCursorTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  coopname!: string;

  @Column({ name: 'matrix_room_id', type: 'varchar', length: 255 })
  matrixRoomId!: string;

  @Column({
    name: 'last_origin_server_ts',
    type: 'bigint',
    transformer: {
      to: (v: number): string => String(v),
      from: (v: string): number => Number(v),
    },
  })
  lastOriginServerTs!: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
