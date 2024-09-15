import httpStatus from 'http-status';
import { Mono } from '../models';
import ApiError from '../utils/ApiError';
import config from '../config/config';
import logger from '../config/logger';
import { IAddUser, ICreateUser, IHealthStatus, IInstall } from '../types';
import { generateUsername } from '../../tests/utils/generateUsername';
import { generator } from './document.service';
import { blockchainService, emailService, tokenService, userService } from '.';
import { IUser, userStatus } from '../models/user.model';
import axios from 'axios';
import { getBlockchainInfo } from './blockchain.service';
import { RegistratorContract, type Cooperative } from 'cooptypes';
import type { ISetVars } from '../types/auto-generated/system.validation';
import { VarsSchema } from 'coopdoc-generator-ts';

export const install = async (soviet: IInstall): Promise<void> => {
  const mono = await Mono.findOne({ coopname: config.coopname });
  const info = await getBlockchainInfo();
  const coop = await blockchainService.getCooperative(config.coopname);

  if (!coop) throw new ApiError(httpStatus.BAD_REQUEST, 'Информация о кооперативе не обнаружена');

  if (mono && mono.status != 'install') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Установка уже выполнена');
  }

  const users = [] as IUser[];
  const members = [] as any;
  const sovietExt = [] as any;

  try {
    for (const member of soviet) {
      const username = generateUsername();
      sovietExt.push({ ...member, username });

      const addUser: RegistratorContract.Actions.AddUser.IAddUser = {
        registrator: config.service_username,
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
      username: config.service_username,
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

  logger.info('MONO активирован');
};

export const init = async (): Promise<void> => {
  const mono = await Mono.findOne({ coopname: config.coopname });

  if (!mono)
    await Mono.create({
      coopname: config.coopname,
      status: 'install',
    });

  logger.info('MONO инициализирован');
};

export const getMonoStatus = async (): Promise<IHealthStatus> => {
  const mono = await Mono.findOne({ coopname: config.coopname });

  if (!mono) throw new ApiError(httpStatus.BAD_REQUEST, 'Установщик не найден');

  return mono.status;
};

export const setVars = async (vars: ISetVars): Promise<void> => {
  await generator.save('vars', vars);
};

export const getVarsSchema = async (): Promise<unknown> => {
  return VarsSchema;
};
