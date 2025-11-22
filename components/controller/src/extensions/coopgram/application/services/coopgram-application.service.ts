import { Injectable } from '@nestjs/common';
import { MatrixUserManagementService } from '../../domain/services/matrix-user-management.service';
import { MatrixTokenManagementService } from '../../domain/services/matrix-token-management.service';
import { MatrixApiService } from './matrix-api.service';
import { MatrixUserDomainEntity } from '../../domain/entities/matrix-user.entity';

@Injectable()
export class CoopgramApplicationService {
  constructor(
    private readonly matrixUserManagementService: MatrixUserManagementService,
    private readonly matrixTokenManagementService: MatrixTokenManagementService,
    private readonly matrixApiService: MatrixApiService
  ) {}

  async getIframeToken(coopUsername: string): Promise<{ token: string; expiresAt: Date }> {
    // Проверяем, существует ли пользователь Matrix
    let matrixUser = await this.matrixUserManagementService.getMatrixUserByCoopUsername(coopUsername);

    if (!matrixUser) {
      // Регистрируем пользователя в Matrix
      matrixUser = await this.registerUserInMatrix(coopUsername);
    }

    // Генерируем токен для iframe входа
    const tokenEntity = await this.matrixTokenManagementService.generateToken(coopUsername, matrixUser.matrixUserId);

    return {
      token: tokenEntity.token,
      expiresAt: tokenEntity.expiresAt,
    };
  }

  async validateIframeToken(token: string): Promise<{ coopUsername: string; matrixUserId: string } | null> {
    const tokenEntity = await this.matrixTokenManagementService.validateToken(token);

    if (!tokenEntity) {
      return null;
    }

    return {
      coopUsername: tokenEntity.coopUsername,
      matrixUserId: tokenEntity.matrixUserId,
    };
  }

  private async registerUserInMatrix(coopUsername: string): Promise<MatrixUserDomainEntity> {
    // Генерируем уникальный пароль для Matrix
    const matrixPassword = this.generateMatrixPassword(coopUsername);
    const matrixUsername = coopUsername.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    // Регистрируем пользователя в Matrix через API
    const registerResponse = await this.matrixApiService.registerUser(matrixUsername, matrixPassword);

    // Сохраняем информацию о пользователе
    return this.matrixUserManagementService.createMatrixUser({
      coopUsername,
      matrixUserId: registerResponse.user_id,
      matrixUsername,
      matrixAccessToken: registerResponse.access_token,
      matrixDeviceId: registerResponse.device_id,
      matrixHomeServer: registerResponse.home_server,
    });
  }

  private generateMatrixPassword(username: string): string {
    // Генерируем сложный пароль на основе username и текущего времени
    const timestamp = Date.now().toString();
    return `Coop${username}${timestamp}Matrix!`;
  }

  async getMatrixUserInfo(coopUsername: string): Promise<MatrixUserDomainEntity | null> {
    return this.matrixUserManagementService.getMatrixUserByCoopUsername(coopUsername);
  }
}
