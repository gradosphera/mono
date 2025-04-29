import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IAgenda, IGetAgendaInput } from '../model';

async function loadAgenda(data: IGetAgendaInput): Promise<IAgenda[]> {
  const { [Queries.Agenda.GetAgenda.name]: output } = await client.Query(
    Queries.Agenda.GetAgenda.query,
    {
      variables: {
        data
      }
    }
  );
  
  return output;
}

export const api = {
  loadAgenda
} 