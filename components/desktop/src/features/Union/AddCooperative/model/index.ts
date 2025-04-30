import { TransactResult } from '@wharfkit/session';
import { RegistratorContract } from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';
import { env } from 'src/shared/config';

export function useAddCooperative() {
  async function addCooperative(
    data: RegistratorContract.Actions.RegisterCooperative.IRegisterCooperative
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    data.params.initial = `${parseFloat(data.params.initial).toFixed(4)} ${env.CURRENCY}`
    data.params.minimum = `${parseFloat(data.params.minimum).toFixed(4)} ${env.CURRENCY}`
    data.params.org_initial = `${parseFloat(data.params.org_initial).toFixed(4)} ${env.CURRENCY}`
    data.params.org_minimum = `${parseFloat(data.params.org_minimum).toFixed(4)} ${env.CURRENCY}`

    const result = await useGlobalStore().transact({
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.RegisterCooperative.actionName,
      authorization: [
        {
          actor: session.username,
          permission: 'active',
        },
      ],
      data,
    });

    return result;
  }
  return { addCooperative };
}
