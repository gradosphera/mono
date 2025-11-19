import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'processConvertToAxonStatement'

export const mutation = Selector('Mutation')({
  [name]: [{ signedDocument: $('signedDocument', 'ConvertToAxonStatementSignedDocumentInput!'), convertAmount: $('convertAmount', 'String!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  signedDocument: ModelTypes['ConvertToAxonStatementSignedDocumentInput']
  convertAmount: string
}
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
