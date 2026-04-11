import { documentSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'capitalGenerateProgramMoneyInvestStatement'

export const mutation = Selector('Mutation')({
  [name]: [
    {
      data: $('data', 'ProgramCapitalizationMoneyInvestStatementGenerateDocumentInput!'),
      options: $('options', 'GenerateDocumentOptionsInput'),
    },
    documentSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['ProgramCapitalizationMoneyInvestStatementGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
