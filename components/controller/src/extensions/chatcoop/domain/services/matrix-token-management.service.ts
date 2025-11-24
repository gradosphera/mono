import { Inject, Injectable } from '@nestjs/common';
import { MatrixTokenDomainEntity } from '../entities/matrix-token.entity';
import { MATRIX_TOKEN_REPOSITORY, MatrixTokenRepository } from '../repositories/matrix-token.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MatrixTokenManagementService {
  constructor(@Inject(MATRIX_TOKEN_REPOSITORY) private readonly matrixTokenRepository: MatrixTokenRepository) {}

  async generateToken(coopUsername: string, matrixUserId: string): Promise<MatrixTokenDomainEntity> {
    // Удаляем просроченные токены
    await this.matrixTokenRepository.deleteExpired();

    // Проверяем, есть ли действующий токен для пользователя
    const existingToken = await this.matrixTokenRepository.findValidByCoopUsername(coopUsername);
    if (existingToken) {
      return existingToken;
    }

    // Генерируем новый токен на 10 секунд
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 1000); // 10 секунд

    return this.matrixTokenRepository.create({
      coopUsername,
      matrixUserId,
      token,
      expiresAt,
      isUsed: false,
    });
  }

  async validateToken(token: string): Promise<MatrixTokenDomainEntity | null> {
    const tokenEntity = await this.matrixTokenRepository.findByToken(token);

    if (!tokenEntity) {
      return null;
    }

    // Проверяем срок действия
    if (tokenEntity.expiresAt < new Date() || tokenEntity.isUsed) {
      return null;
    }

    // Помечаем токен как использованный
    await this.matrixTokenRepository.markAsUsed(tokenEntity.id);

    return tokenEntity;
  }

  async getValidTokenForUser(coopUsername: string): Promise<MatrixTokenDomainEntity | null> {
    return this.matrixTokenRepository.findValidByCoopUsername(coopUsername);
  }
}
