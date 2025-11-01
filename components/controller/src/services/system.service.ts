// DEPRECATED: Этот файл устарел и будет удален после полной миграции на GraphQL
// Используйте SystemDomainInteractor напрямую

import type { SystemStatusInterface } from '../types';
import type { IInit, ISetVars, ISetWif, IInstall } from '../types/auto-generated/system.validation';
import { VarsSchema } from '@coopenomics/factory';
import type { Cooperative } from 'cooptypes';
import { getSystemInteractor } from '~/infrastructure/di/get-interactor';
import type { SetWifInputDomainInterface } from '~/domain/system/interfaces/set-wif-input-domain.interface';

// Адаптеры для обратной совместимости REST API
// Вызывают SystemDomainInteractor

export const setWif = async (params: ISetWif): Promise<void> => {
  const interactor = await getSystemInteractor();
  await interactor.setWif(params as SetWifInputDomainInterface);
};

export const install = async (data: IInstall): Promise<void> => {
  // const interactor = await getSystemInteractor();
  // // Сначала setWif
  // await interactor.setWif({
  //   permission: 'active',
  //   username: data.vars.coopname,
  //   wif: data.wif,
  // });
  // // Затем install
  // await interactor.install(data);
};

export const init = async (data: IInit): Promise<void> => {
  const interactor = await getSystemInteractor();
  await interactor.init(data);
};

export const getMonoStatus = async (): Promise<SystemStatusInterface> => {
  const interactor = await getSystemInteractor();
  const info = await interactor.getInfo();
  return info.system_status;
};

export const setVars = async (vars: ISetVars): Promise<void> => {
  const interactor = await getSystemInteractor();
  await interactor.update({ vars });
};

export const getVars = async (): Promise<Cooperative.Model.IVars> => {
  const interactor = await getSystemInteractor();
  const info = await interactor.getInfo();
  return info.vars as Cooperative.Model.IVars;
};

export const getVarsSchema = async (): Promise<unknown> => {
  return VarsSchema;
};
