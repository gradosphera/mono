import { DraftContract } from "cooptypes"
import { api } from "../eos"

export const editTranslation = async(params: DraftContract.Actions.EditTranslation.IEditTranslation) => {
  await api.transact({
      actions: [
        {
          account: DraftContract.contractName.production,
          name: DraftContract.Actions.EditTranslation.actionName,
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
  
  console.log("Перевод установлен для:", params.translate_id)
}