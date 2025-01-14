import type { IBranch } from 'src/entities/Branch/model'
import type { IEditBranchInput } from '../model'
import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

async function editBranch(data: IEditBranchInput): Promise<IBranch>{
  const {[Mutations.Branches.EditBranch.name]: result} = await client.Mutation(Mutations.Branches.EditBranch.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  editBranch
}
