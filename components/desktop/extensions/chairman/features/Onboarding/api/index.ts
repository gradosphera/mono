import { client } from 'src/shared/api/client';
import { Mutations, Queries } from '@coopenomics/sdk';

export type OnboardingState = Queries.Chairman.GetOnboardingState.IOutput[typeof Queries.Chairman.GetOnboardingState.name];

const loadOnboardingState = async () => {
  const { [Queries.Chairman.GetOnboardingState.name]: state } = await client.Query(
    Queries.Chairman.GetOnboardingState.query,
  );
  return state;
};

const completeAgendaStep = async (
  data: Mutations.Chairman.CompleteOnboardingAgendaStep.IInput['data'],
) => {
  const { [Mutations.Chairman.CompleteOnboardingAgendaStep.name]: state } = await client.Mutation(
    Mutations.Chairman.CompleteOnboardingAgendaStep.mutation,
    {
      variables: { data },
    },
  );
  return state;
};

const completeGeneralMeetStep = async (
  data: Mutations.Chairman.CompleteOnboardingGeneralMeetStep.IInput['data'],
) => {
  const {
    [Mutations.Chairman.CompleteOnboardingGeneralMeetStep.name]: state,
  } = await client.Mutation(Mutations.Chairman.CompleteOnboardingGeneralMeetStep.mutation, {
    variables: { data },
  });
  return state;
};

export const api = {
  loadOnboardingState,
  completeAgendaStep,
  completeGeneralMeetStep,
};
