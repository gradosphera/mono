import { Inject, Injectable } from '@nestjs/common';
import { MatrixUserDomainEntity } from '../entities/matrix-user.entity';
import { MATRIX_USER_REPOSITORY, MatrixUserRepository } from '../repositories/matrix-user.repository';

@Injectable()
export class MatrixUserManagementService {
  constructor(@Inject(MATRIX_USER_REPOSITORY) private readonly matrixUserRepository: MatrixUserRepository) {}

  async createMatrixUser(data: {
    coopUsername: string;
    matrixUserId: string;
    matrixUsername: string;
    matrixAccessToken: string;
    matrixDeviceId: string;
    matrixHomeServer: string;
  }): Promise<MatrixUserDomainEntity> {
    // Проверяем, существует ли уже пользователь
    const existingUser = await this.matrixUserRepository.findByCoopUsername(data.coopUsername);
    if (existingUser) {
      throw new Error('Matrix пользователь для данного кооперативного пользователя уже существует');
    }

    const matrixUser = await this.matrixUserRepository.create({
      coopUsername: data.coopUsername,
      matrixUserId: data.matrixUserId,
      matrixUsername: data.matrixUsername,
      matrixAccessToken: data.matrixAccessToken,
      matrixDeviceId: data.matrixDeviceId,
      matrixHomeServer: data.matrixHomeServer,
      isRegistered: true,
      lastTokenRefresh: new Date(),
    });

    return matrixUser;
  }

  async getMatrixUserByCoopUsername(coopUsername: string): Promise<MatrixUserDomainEntity | null> {
    return this.matrixUserRepository.findByCoopUsername(coopUsername);
  }

  async updateAccessToken(coopUsername: string, newAccessToken: string): Promise<MatrixUserDomainEntity> {
    const user = await this.matrixUserRepository.findByCoopUsername(coopUsername);
    if (!user) {
      throw new Error('Matrix пользователь не найден');
    }

    return this.matrixUserRepository.update(user.id, {
      matrixAccessToken: newAccessToken,
      lastTokenRefresh: new Date(),
    });
  }

  async ensureMatrixUserExists(coopUsername: string): Promise<MatrixUserDomainEntity> {
    let matrixUser = await this.matrixUserRepository.findByCoopUsername(coopUsername);

    if (!matrixUser) {
      // Создаем временную запись до регистрации в Matrix
      matrixUser = await this.matrixUserRepository.create({
        coopUsername,
        matrixUserId: '',
        matrixUsername: '',
        matrixAccessToken: '',
        matrixDeviceId: '',
        matrixHomeServer: '',
        isRegistered: false,
        lastTokenRefresh: new Date(),
      });
    }

    return matrixUser;
  }
}
