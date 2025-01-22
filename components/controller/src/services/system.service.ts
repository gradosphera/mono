import httpStatus from 'http-status';
import { Mono } from '../models';
import ApiError from '../utils/ApiError';
import config from '../config/config';
import logger from '../config/logger';
import { ICreateUser, SystemStatusInterface, IInstall } from '../types';
import { generateUsername } from '../utils/generate-username';
import { generator } from './document.service';
import { blockchainService, emailService, tokenService, userService } from '.';
import { IUser, userStatus } from '../types/user.types';
import { getBlockchainAccount, getBlockchainInfo, hasActiveKey } from './blockchain.service';
import { RegistratorContract, type Cooperative } from 'cooptypes';
import type { IInit, ISetVars, ISetWif } from '../types/auto-generated/system.validation';
import { VarsSchema } from '@coopenomics/factory';
import Vault, { wifPermissions } from '../models/vault.model';
import { PrivateKey } from '@wharfkit/antelope';
import type { SetWifInputDomainInterface } from '~/domain/system/interfaces/set-wif-input-domain.interface';
import { PaymentMethodDomainEntity } from '~/domain/payment-method/entities/method-domain.entity';
import { randomUUID } from 'crypto';

export const setWif = async (params: SetWifInputDomainInterface): Promise<void> => {
  //check auth
  const blockchainAccount = await getBlockchainAccount(params.username);

  const publicKey = PrivateKey.fromString(params.wif).toPublic().toLegacyString();

  const hasKey = hasActiveKey(blockchainAccount, publicKey);

  if (!hasKey) throw new ApiError(httpStatus.UNAUTHORIZED, 'Неверный приватный ключ');

  await Vault.setWif(
    params.username,
    params.wif,
    params.permission ? (params.permission as wifPermissions) : wifPermissions.Active
  );
};

export const install = async (data: IInstall): Promise<void> => {
  const mono = await Mono.findOne({ coopname: config.coopname });
  const info = await getBlockchainInfo();
  const coop = await blockchainService.getCooperative(config.coopname);

  if (!coop) throw new ApiError(httpStatus.BAD_REQUEST, 'Информация о кооперативе не обнаружена');

  if (mono && mono.status != 'install') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Установка уже выполнена');
  }

  await setWif({
    permission: 'active',
    username: config.coopname,
    wif: data.wif,
  });

  const users = [] as IUser[];
  const members = [] as any;
  const sovietExt = [] as any;
  const soviet = data.soviet;

  try {
    for (const member of soviet) {
      const username = generateUsername();
      sovietExt.push({ ...member, username });

      const addUser: RegistratorContract.Actions.AddUser.IAddUser = {
        registrator: config.coopname,
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

      //Генерируем токен и отправляем приглашение
      const token = await tokenService.generateInviteToken(member.individual_data.email);
      await emailService.sendInviteEmail(member.individual_data.email, token);

      //Добавляем в массив членов для отправки в бч
      members.push({
        username: username,
        is_voting: true,
        position_title: member.role === 'chairman' ? 'Председатель совета' : 'Член совета',
        position: member.role,
      });

      users.push(user);
    }

    const chairman = sovietExt.find((el) => el.role == 'chairman');

    //TODO создаёт доску совета
    await blockchainService.createBoard({
      coopname: config.coopname,
      username: config.coopname,
      type: 'soviet',
      members: members,
      name: 'Совет',
      description: '',
    });
  } catch (e: any) {
    console.log('on error', e);
    for (const user of users) {
      await userService.deleteUserByUsername(user.username);
      await generator.del('individual', { username: user.username });
    }
    throw new ApiError(httpStatus.BAD_REQUEST, e.message);
  }

  await Mono.updateOne(
    { coopname: config.coopname },
    {
      status: 'active',
    }
  );

  logger.info('Система установлена');
};

export const init = async (data: IInit): Promise<void> => {
  const mono = await Mono.findOne({ coopname: config.coopname });

  if (mono) throw new ApiError(httpStatus.BAD_REQUEST, 'MONO уже инициализирован');

  const { bank_account, ...organization } = data.organization_data;

  const paymentMethod = new PaymentMethodDomainEntity({
    username: config.coopname,
    method_id: randomUUID().toString(),
    method_type: 'bank_transfer',
    data: bank_account,
    is_default: true,
  });

  await generator.save('paymentMethod', paymentMethod);

  await Mono.create({
    coopname: config.coopname,
    status: 'install',
  });

  await setVars(data.vars);

  await generator.save('organization', { username: config.coopname, ...organization });

  logger.info('Система инициализирована');
};

export const getMonoStatus = async (): Promise<SystemStatusInterface> => {
  const mono = await Mono.findOne({ coopname: config.coopname });

  if (!mono) return 'maintenance';
  else return mono.status;
};

export const setVars = async (vars: ISetVars): Promise<void> => {
  await generator.save('vars', vars);
};

export const getVars = async (): Promise<Cooperative.Model.IVars> => {
  return (await generator.get('vars', {})) as Cooperative.Model.IVars;
};

export const getVarsSchema = async (): Promise<unknown> => {
  return VarsSchema;
};
