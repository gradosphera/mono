import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IGetMeetsInput, IGetMeetInput } from '../types';

async function loadMeets(data: IGetMeetsInput) {
  const { [Queries.Meet.GetMeets.name]: output } = await client.Query(
    Queries.Meet.GetMeets.query,
    {
      variables: {
        data
      }
    }
  );
  return output;
}

async function loadMeet(data: IGetMeetInput) {
  const { [Queries.Meet.GetMeet.name]: output } = await client.Query(
    Queries.Meet.GetMeet.query,
    {
      variables: {
        data
      }
    }
  );
  return output;
}

export const api = {
  loadMeets,
  loadMeet
}
