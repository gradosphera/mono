import { documentSelector } from '../../selectors/common/documentSelector'
import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

export const name = 'generateDocument'

// Селектор мутации
export const mutation = Selector('Mutation')({
  [name]: [
    {
      input: $('input', 'GenerateAnyDocumentInput!'),
    },
    documentSelector,
  ],
})

// Интерфейс для входных данных
export interface IInput {
/**
 * @private
 */
  [key: string]: unknown

  input: ModelTypes['GenerateAnyDocumentInput']
}

// Тип выходных данных
export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation>
