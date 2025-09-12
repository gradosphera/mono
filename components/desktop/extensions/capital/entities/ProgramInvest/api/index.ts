import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IGetProgramInvestsInput,
  IProgramInvestsPagination,
} from '../model';

async function loadProgramInvests(
  data: IGetProgramInvestsInput,
): Promise<IProgramInvestsPagination> {
  const { [Queries.Capital.GetProgramInvests.name]: output } =
    await client.Query(Queries.Capital.GetProgramInvests.query, {
      variables: data,
    });
  return output;
}

export const api = {
  loadProgramInvests,
};
