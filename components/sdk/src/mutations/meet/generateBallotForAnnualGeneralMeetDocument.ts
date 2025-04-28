import { documentSelector } from '../../selectors'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateBallotForAnnualGeneralMeetDocument'

/**
 * Генерация бюллетеня для голосования на общем собрании пайщиков
 */
export const mutation = Selector('Mutation')({
  [name]: [
    {
      data: $('data', 'AnnualGeneralMeetingVotingBallotGenerateDocumentInput!'),
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

  data: ModelTypes['AnnualGeneralMeetingVotingBallotGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
