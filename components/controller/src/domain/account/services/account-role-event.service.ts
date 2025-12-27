// domain/account/services/account-role-event.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { SovietContract } from 'cooptypes';
import config from '~/config/config';
import type { IAction } from '~/types';
import { USER_REPOSITORY, UserRepository } from '~/domain/user/repositories/user.repository';

/**
 * Сервис обработки событий ролей аккаунтов
 * Подписывается на события updateboard и createboard для обновления ролей пользователей
 */
@Injectable()
export class AccountRoleEventService {
  constructor(
    private readonly logger: WinstonLoggerService,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository
  ) {
    this.logger.setContext(AccountRoleEventService.name);
  }

  /**
   * Обработчик события обновления совета
   */
  @OnEvent(`action::${SovietContract.contractName.production}::updateboard`)
  async handleUpdateBoard(event: IAction): Promise<void> {
    await this.handleBoardUpdate(event);
  }

  /**
   * Обработчик события создания совета
   */
  @OnEvent(`action::${SovietContract.contractName.production}::createboard`)
  async handleCreateBoard(event: IAction): Promise<void> {
    await this.handleBoardUpdate(event);
  }

  /**
   * Общий обработчик обновления ролей пользователей
   */
  private async handleBoardUpdate(event: IAction): Promise<void> {
    try {
      const action = event.data as any; // TODO: Правильная типизация будет добавлена позже

      // Проверяем что действие относится к нашему кооперативу
      if (action.coopname !== config.coopname) {
        return;
      }

      this.logger.info(`Processing board update for coopname: ${action.coopname}`);

      // Сброс всех прав у пользователей, которые были member или chairman
      const users = await this.userRepository.findByRoles(['member', 'chairman']);
      for (const user of users) {
        await this.userRepository.updateByUsername(user.username, { role: 'user' });
      }

      this.logger.debug(`Reset roles for ${users.length} users`);

      // Устанавливаем роли member для всех участников совета
      for (const member of action.members) {
        try {
          await this.userRepository.updateByUsername(member.username, { role: 'member' });
          this.logger.debug(`Set member role for user: ${member.username}`);
        } catch (error: any) {
          this.logger.error(`Не удалось установить роль члена для пользователя ${member.username}: ${error.message}`);
        }
      }

      // Устанавливаем роль chairman для председателя
      const chairman_username = action.members.find((el) => el.position === 'chairman')?.username;

      if (chairman_username) {
        try {
          await this.userRepository.updateByUsername(chairman_username, { role: 'chairman' });
          this.logger.info(`Set chairman role for user: ${chairman_username}`);
        } catch (error: any) {
          this.logger.error(
            `Не удалось установить роль председателя для пользователя ${chairman_username}: ${error.message}`
          );
        }
      } else {
        this.logger.warn('Председатель не найден среди членов совета');
      }

      this.logger.info(`Board roles updated successfully for ${action.members.length} members`);
    } catch (error: any) {
      this.logger.error(`Ошибка обработки обновления совета: ${error.message}`, error.stack);
    }
  }
}
