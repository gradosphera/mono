import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/coopjs';
import type { IBranch, IGetBranchesInput } from '../model';

async function loadBranches(data: IGetBranchesInput): Promise<IBranch[]> {
  const { getBranches: output } = await client.Query(
    Queries.getBranches,
    {
      variables: {
        data
      }
    }
  );
  return output;
}

async function loadPublicBranches(data: IGetBranchesInput): Promise<Queries.IPublicBranch[]> {
  const { getBranches: output } = await client.Query(
    Queries.getPublicBranches,
    {
      variables: {
        data
      }
    }
  );
  console.log('output', output)
  return output;
}


export const api ={
  loadBranches,
  loadPublicBranches
}
