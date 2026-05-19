import { PrivateKey } from '@wharfkit/session';

/**
 * TODO[E10/SDK]: подключить on-chain `change-key` action из Mutations.Accounts
 * (после согласования с backend gateway по имени mutation; pattern см.
 * features/User/ResetKey/api). Сейчас здесь UI-заглушка — реализация
 * привязывается, когда страница change-key выходит на маршрут реального
 * дашборда. Бизнес-логика менять контракт сторов и компонентов не должна.
 */
export interface IChangeKeyInput {
  current_wif: string;
  new_wif: string;
}

async function changeKey(data: IChangeKeyInput): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 600));
  return !!data.current_wif && !!data.new_wif;
}

function deriveNewWif(): string {
  return PrivateKey.generate('K1').toString();
}

export const api = {
  changeKey,
  deriveNewWif,
};
