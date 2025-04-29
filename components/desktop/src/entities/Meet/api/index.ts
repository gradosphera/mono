import { client } from 'src/shared/api/client';
import { Queries, Mutations } from '@coopenomics/sdk';
import type { IGetMeetsInput, IGetMeetInput, ICloseMeetInput, IRestartMeetInput } from '../types';

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

async function closeMeet(data: ICloseMeetInput) {
  const { [Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.name]: output } = await client.Mutation(
    Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.mutation,
    {
      variables: {
        data
      }
    }
  );
  return output;
}

async function restartMeet(data: IRestartMeetInput) {
  const { [Mutations.Meet.RestartAnnualGeneralMeet.name]: output } = await client.Mutation(
    Mutations.Meet.RestartAnnualGeneralMeet.mutation,
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
  loadMeet,
  closeMeet,
  restartMeet
}
