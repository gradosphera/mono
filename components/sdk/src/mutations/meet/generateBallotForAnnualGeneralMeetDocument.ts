import { rawDocumentSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateBallotForAnnualGeneralMeetDocument'

/**
 * Генерация бюллетеня для голосования на общем собрании пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [
    {
      data: $('data', 'GenerateBallotForAnnualGeneralMeetInput!'),
      options: $('options', 'GenerateDocumentOptionsInput'),
    },
    rawDocumentSelector,
  ],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['GenerateBallotForAnnualGeneralMeetInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
