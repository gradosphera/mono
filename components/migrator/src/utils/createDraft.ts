import { DraftContract } from "cooptypes"
import { api } from "../eos"

export const createDraft = async(params: DraftContract.Actions.CreateDraft.ICreateDraft) => {
    
  await api.transact(
    {
      actions: [
        {
          account: DraftContract.contractName.production,
          name: DraftContract.Actions.CreateDraft.actionName,
          authorization: [
            {
              actor: 'eosio',
              permission: "active",
            },
          ],
          data: {
            ...params,
          },
        },
      ],
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  )

  console.log("Шаблон создан: ", params)
}
  