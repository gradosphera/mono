import { $, Selector, type ModelTypes } from '../../zeus/index'
import { rawGeneratedDocumentSelector } from '../../selectors/documents/documentAggregateSelector'

export const name = 'generateReturnByMoneyStatementDocument'

// Селектор мутации
export const mutation = Selector('Mutation')({
  [name]: [
    {
      data: $('data', 'ReturnByMoneyGenerateDocumentInput!'),
      options: $('options', 'GenerateDocumentOptionsInput'),
    },
    rawGeneratedDocumentSelector,
  ],
})

// Интерфейс для входных данных
export interface IInput {
  data: ModelTypes['ReturnByMoneyGenerateDocumentInput']
  options?: ModelTypes['GenerateDocumentOptionsInput']
}

// Тип выходных данных
export type IOutput = {
  [name]: ModelTypes['GeneratedDocument']
}
