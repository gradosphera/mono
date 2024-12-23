import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/coopjs'
import type { ISelectBranchInput } from '../model'

async function selectBranch(data: ISelectBranchInput): Promise<boolean>{
  const {[Mutations.Branches.SelectBranch.name]: result} = await client.Mutation(Mutations.Branches.SelectBranch.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  selectBranch
}
