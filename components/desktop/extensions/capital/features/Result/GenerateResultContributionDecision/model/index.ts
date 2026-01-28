import { api } from '../api';
import type { Mutations } from '@coopenomics/sdk';

export type IGenerateResultContributionDecisionData = Mutations.Capital.GenerateResultContributionDecision.IInput['data'];
export type IGenerateResultContributionDecisionResult = Mutations.Capital.GenerateResultContributionDecision.IOutput[typeof Mutations.Capital.GenerateResultContributionDecision.name];

export function useGenerateResultContributionDecision() {
  /**
   * Генерирует документ для решения о приросте капитализации
   */
  async function generateResultContributionDecision(data: IGenerateResultContributionDecisionData): Promise<IGenerateResultContributionDecisionResult> {
    const { generateResultContributionDecision: generate } = api;

    return await generate(data);
  }

  return {
    generateResultContributionDecision,
  };
}

export const generateResultContributionDecisionModel = {
  useGenerateResultContributionDecision,
};
