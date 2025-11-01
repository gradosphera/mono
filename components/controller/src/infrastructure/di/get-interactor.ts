// Утилита для получения SystemDomainInteractor из NestJS DI контейнера
// для использования в старых REST контроллерах

import { SystemDomainInteractor } from '~/domain/system/interactors/system.interactor';

let systemInteractor: SystemDomainInteractor;

export function setSystemInteractor(interactor: SystemDomainInteractor) {
  systemInteractor = interactor;
}

export async function getSystemInteractor(): Promise<SystemDomainInteractor> {
  if (!systemInteractor) {
    throw new Error('SystemDomainInteractor не инициализирован');
  }
  return systemInteractor;
}
