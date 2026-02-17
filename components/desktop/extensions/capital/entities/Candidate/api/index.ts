import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';

/**
 * Получить список кандидатов с учетом фильтров
 */
async function getCapitalCandidates(
  data: Queries.Capital.GetCapitalCandidates.IInput
): Promise<Queries.Capital.GetCapitalCandidates.IOutput[typeof Queries.Capital.GetCapitalCandidates.name]> {
  const { [Queries.Capital.GetCapitalCandidates.name]: output } = await client.Query(
    Queries.Capital.GetCapitalCandidates.query,
    {
      variables: {
        filter: data.filter,
        options: data.options,
      },
    }
  );

  return output;
}

export const api = {
  getCapitalCandidates,
};
