import type { IBranch } from 'src/entities/Branch/model'
import type { IEditBranchInput } from '../model'
import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/coopjs'

async function editBranch(data: IEditBranchInput): Promise<IBranch>{
  const {editBranch: result} = await client.Mutation(Mutations.editBranch, {variables: {
    data
  }})

  return result
}

export const api = {
  editBranch
}
