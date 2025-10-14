import { api } from '../api';
import { useSystemStore } from 'src/entities/System/model';
import type { Mutations } from '@coopenomics/sdk';

export type IGenerateResultContributionDecisionData = Mutations.Capital.GenerateResultContributionDecision.IInput['data'];
export type IGenerateResultContributionDecisionResult = Mutations.Capital.GenerateResultContributionDecision.IOutput[typeof Mutations.Capital.GenerateResultContributionDecision.name];

export function useGenerateResultContributionDecision() {
  const { info } = useSystemStore();

  /**
   * Генерирует документ для решения о приросте капитализации
   */
  async function generateResultContributionDecision(data: Omit<IGenerateResultContributionDecisionData, 'coopname'>): Promise<IGenerateResultContributionDecisionResult> {
    const { generateResultContributionDecision: generate } = api;

    return await generate({
      coopname: info.coopname,
      ...data
    });
  }

  return {
    generateResultContributionDecision,
  };
}

export const generateResultContributionDecisionModel = {
  useGenerateResultContributionDecision,
};
