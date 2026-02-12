import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IConvertSegmentInput =
  Mutations.Capital.ConvertSegment.IInput['data'];
export type IConvertSegmentOutput =
  Mutations.Capital.ConvertSegment.IOutput[typeof Mutations.Capital.ConvertSegment.name];

export type IGenerateConvertStatementInput =
  Mutations.Capital.GenerateGenerationToCapitalizationConvertStatement.IInput;
export type IGenerateConvertStatementOutput =
  Mutations.Capital.GenerateGenerationToCapitalizationConvertStatement.IOutput[typeof Mutations.Capital.GenerateGenerationToCapitalizationConvertStatement.name];


async function convertSegment(
  data: IConvertSegmentInput,
): Promise<IConvertSegmentOutput> {
  const { [Mutations.Capital.ConvertSegment.name]: result } =
    await client.Mutation(Mutations.Capital.ConvertSegment.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

async function generateConvertStatement(
  data: IGenerateConvertStatementInput['data'],
  options?: IGenerateConvertStatementInput['options'],
): Promise<IGenerateConvertStatementOutput> {
  const { [Mutations.Capital.GenerateGenerationToCapitalizationConvertStatement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateGenerationToCapitalizationConvertStatement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}


export const api = {
  convertSegment,
  generateConvertStatement,
};
