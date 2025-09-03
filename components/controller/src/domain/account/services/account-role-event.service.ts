// domain/account/services/account-role-event.service.ts

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { SovietContract } from 'cooptypes';
import config from '~/config/config';
import type { IAction } from '~/types';

/**
 * Сервис обработки событий ролей аккаунтов
 * Подписывается на события updateboard и createboard для обновления ролей пользователей
 */
@Injectable()
export class AccountRoleEventService {
  constructor(private readonly logger: WinstonLoggerService) {
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

      // Импортируем User модель и userService динамически, чтобы избежать циклических зависимостей
      const { User } = await import('~/models');
      const { userService } = await import('~/services');

      // Сброс всех прав у пользователей, которые были member или chairman
      const users = await User.find({ role: { $in: ['member', 'chairman'] } }).exec();
      for (const user of users) {
        user.role = 'user';
        await user.save();
      }

      this.logger.debug(`Reset roles for ${users.length} users`);

      // Устанавливаем роли member для всех участников совета
      for (const member of action.members) {
        try {
          const user = await userService.getUserByUsername(member.username);
          user.role = 'member';
          await user.save();
          this.logger.debug(`Set member role for user: ${member.username}`);
        } catch (error: any) {
          this.logger.error(`Failed to set member role for user ${member.username}: ${error.message}`);
        }
      }

      // Устанавливаем роль chairman для председателя
      const chairman_username = action.members.find((el) => el.position === 'chairman')?.username;

      if (chairman_username) {
        try {
          const chairman = await userService.getUserByUsername(chairman_username);
          chairman.role = 'chairman';
          await chairman.save();
          this.logger.info(`Set chairman role for user: ${chairman_username}`);
        } catch (error: any) {
          this.logger.error(`Failed to set chairman role for user ${chairman_username}: ${error.message}`);
        }
      } else {
        this.logger.warn('No chairman found in board members');
      }

      this.logger.info(`Board roles updated successfully for ${action.members.length} members`);
    } catch (error: any) {
      this.logger.error(`Error processing board update: ${error.message}`, error.stack);
    }
  }
}
