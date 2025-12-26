import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { TokenDomainEntity } from '~/domain/token/entities/token-domain.entity';
import type { TokenDomainInterface } from '~/domain/token/interfaces/token-domain.interface';
import type { TokenType } from '~/types/token.types';

/**
 * TypeORM сущность для токенов
 * Хранит JWT токены пользователей системы
 */
@Entity('tokens')
@Index(['token', 'type']) // Индекс для быстрого поиска по токену и типу
@Index(['userId', 'type']) // Индекс для поиска токенов пользователя по типу
@Index(['expires']) // Индекс для поиска истекших токенов
export class TokenEntity implements TokenDomainInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 1024, unique: true })
  token!: string;

  @Column({ name: 'user_id', length: 50 })
  userId!: string;

  @Column({ length: 20 })
  type!: TokenType;

  @Column({ type: 'timestamp' })
  expires!: Date;

  @Column({ default: false })
  blacklisted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  constructor(data?: TokenDomainEntity) {
    if (data) {
      this.id = data.id || '';
      this.token = data.token;
      this.userId = data.userId;
      this.type = data.type;
      this.expires = data.expires;
      this.blacklisted = data.blacklisted;
      this.createdAt = data.createdAt || new Date();
      this.updatedAt = data.updatedAt || new Date();
    }
  }

  /**
   * Преобразует ORM-сущность в доменную сущность
   */
  toDomainEntity(): TokenDomainEntity {
    return new TokenDomainEntity(
      this.token,
      this.userId,
      this.type as any,
      this.expires,
      this.blacklisted,
      this.createdAt,
      this.updatedAt,
      this.id
    );
  }

  /**
   * Создает ORM-сущность из доменной сущности
   */
  static fromDomainEntity(domainEntity: TokenDomainEntity): TokenEntity {
    return new TokenEntity(domainEntity);
  }
}
