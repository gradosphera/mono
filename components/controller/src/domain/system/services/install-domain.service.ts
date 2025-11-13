import { Injectable, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import config from '~/config/config';
import logger from '~/config/logger';
import { RegistratorContract } from 'cooptypes';
import { blockchainService, tokenService, userService } from '~/services';
import { generator } from '~/services/document.service';
import { generateUsername } from '~/utils/generate-username';
import { IUser, userStatus } from '~/types/user.types';
import { ICreateUser } from '~/types';
import type { InstallInputDomainInterface } from '../interfaces/install-input-domain.interface';
import { VARS_REPOSITORY, VarsRepository } from '~/domain/common/repositories/vars.repository';
import { MONO_STATUS_REPOSITORY, MonoStatusRepository } from '~/domain/common/repositories/mono-status.repository';
import { SystemStatus } from '~/application/system/dto/system-status.dto';
import { AccountDomainService, ACCOUNT_DOMAIN_SERVICE } from '~/domain/account/services/account-domain.service';
import { NovuWorkflowAdapter } from '~/infrastructure/novu/novu-workflow.adapter';
import { NOVU_WORKFLOW_PORT } from '~/domain/notification/interfaces/novu-workflow.port';
import type { WorkflowTriggerDomainInterface } from '~/domain/notification/interfaces/workflow-trigger-domain.interface';
import { Workflows } from '@coopenomics/notifications';

@Injectable()
export class InstallDomainService {
  constructor(
    @Inject(VARS_REPOSITORY) private readonly varsRepository: VarsRepository,
    @Inject(MONO_STATUS_REPOSITORY) private readonly monoStatusRepository: MonoStatusRepository,
    @Inject(ACCOUNT_DOMAIN_SERVICE) private readonly accountDomainService: AccountDomainService,
    @Inject(NOVU_WORKFLOW_PORT) private readonly novuWorkflowAdapter: NovuWorkflowAdapter
  ) {}

  async install(data: InstallInputDomainInterface): Promise<void> {
    const status = await this.monoStatusRepository.getStatus();

    // Разрешаем установку ТОЛЬКО если система в статусе 'initialized' (после initSystem)
    if (status !== SystemStatus.initialized) {
      throw new BadRequestException(
        `Установка невозможна. Текущий статус: ${status}. Требуется статус: ${SystemStatus.initialized}`
      );
    }

    const info = await blockchainService.getBlockchainInfo();
    const coop = await blockchainService.getCooperative(config.coopname);

    if (!coop) throw new BadRequestException('Информация о кооперативе не обнаружена');

    const users = [] as IUser[];
    const members = [] as any;
    const sovietExt = [] as any;
    const soviet = data.soviet;

    try {
      for (const member of soviet) {
        const username = generateUsername();
        sovietExt.push({ ...member, username });

        const addUser: RegistratorContract.Actions.AddUser.IAddUser = {
          coopname: config.coopname,
          referer: '',
          username,
          type: 'individual',
          created_at: info.head_block_time,
          initial: coop.initial,
          minimum: coop.minimum,
          spread_initial: false,
          meta: '',
        };

        await blockchainService.addUser(addUser);

        const createUser: ICreateUser = {
          email: member.individual_data.email,
          individual_data: member.individual_data,
          referer: '',
          role: 'user',
          type: 'individual',
          username,
        };

        const user = await userService.createUser(createUser);
        user.status = userStatus['4_Registered'];
        user.is_registered = true;
        await user.save();

        // Настраиваем подписчика уведомлений для члена совета
        try {
          await this.accountDomainService.setupNotificationSubscriber(username, 'члена совета');
        } catch (error: any) {
          logger.error(`Ошибка настройки подписчика NOVU для члена совета ${username}: ${error.message}`, error.stack);
        }

        // Добавляем в массив членов для отправки в блокчейн
        members.push({
          username: username,
          is_voting: true,
          position_title: member.role === 'chairman' ? 'Председатель совета' : 'Член совета',
          position: member.role,
        });

        users.push(user);
      }

      // Создаём доску совета
      await blockchainService.createBoard({
        coopname: config.coopname,
        username: config.coopname,
        type: 'soviet',
        members: members,
        name: 'Совет',
        description: '',
      });

      // Отправляем приглашения только после успешного создания совета
      for (const member of sovietExt) {
        const token = await tokenService.generateInviteToken(member.individual_data.email);
        const inviteUrl = `${config.base_url}/${config.coopname}/auth/invite?token=${token}`;

        const payload: Workflows.Invite.IPayload = {
          inviteUrl,
        };

        const triggerData: WorkflowTriggerDomainInterface = {
          name: Workflows.Invite.id,
          to: {
            subscriberId: member.username, // используем username как subscriberId
            email: member.individual_data.email,
          },
          payload,
        };

        await this.novuWorkflowAdapter.triggerWorkflow(triggerData);
      }
    } catch (e: any) {
      // Откат изменений в случае ошибки
      for (const user of users) {
        await userService.deleteUserByUsername(user.username);
        await generator.del('individual', { username: user.username });
      }
      throw new BadRequestException(e.message);
    }

    // Сохраняем переменные кооператива
    await this.varsRepository.create(data.vars);

    // Обновляем статус на активный
    await this.monoStatusRepository.setStatus(SystemStatus.active);

    // Проверяем, что статус действительно обновился
    const updatedStatus = await this.monoStatusRepository.getStatus();
    if (updatedStatus !== SystemStatus.active) {
      throw new BadRequestException('Не удалось обновить статус системы');
    }

    logger.info('Система установлена');
  }
}
