import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/coopjs';
import type { IBranch, IGetBranchesInput, IPublicBranch } from '../model';

async function loadBranches(data: IGetBranchesInput): Promise<IBranch[]> {
  const { [Queries.Branches.GetBranches.name]: output } = await client.Query(
    Queries.Branches.GetBranches.query,
    {
      variables: {
        data
      }
    }
  );
  return output;
}

async function loadPublicBranches(data: IGetBranchesInput): Promise<IPublicBranch[]> {
  const { [Queries.Branches.GetPublicBranches.name]: output } = await client.Query(
    Queries.Branches.GetPublicBranches.query,
    {
      variables: {
        data
      }
    }
  );

  return output;
}


export const api ={
  loadBranches,
  loadPublicBranches
}
