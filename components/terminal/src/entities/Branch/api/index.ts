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

export const api ={
  loadBranches
}
