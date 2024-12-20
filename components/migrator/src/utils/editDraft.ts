import { DraftContract } from "cooptypes"
import { api } from "../eos"

export const editDraft = async(params: DraftContract.Actions.EditDraft.IEditDraft) => {
    
  await api.transact(
    {
      actions: [
        {
          account: DraftContract.contractName.production,
          name: DraftContract.Actions.EditDraft.actionName,
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

  console.log("Шаблон отредактирован: ", params)
}