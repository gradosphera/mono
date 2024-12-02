import type { IBranch } from 'src/entities/Branch/model'
import type { ICreateBranchInput } from '../model'
import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/coopjs'

async function createBranch(data: ICreateBranchInput): Promise<IBranch>{
  const {createBranch: result} = await client.Mutation(Mutations.createBranch, {variables: {
    data
  }})

  return result
}

export const api = {
  createBranch
}
