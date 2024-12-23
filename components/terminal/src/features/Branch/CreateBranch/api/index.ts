import type { IBranch } from 'src/entities/Branch/model'
import type { ICreateBranchInput } from '../model'
import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/coopjs'

async function createBranch(data: ICreateBranchInput): Promise<IBranch>{
  const {[Mutations.Branches.CreateBranch.name]: result} = await client.Mutation(Mutations.Branches.CreateBranch.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  createBranch
}
