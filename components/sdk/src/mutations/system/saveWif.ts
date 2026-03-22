import { $, type GraphQLTypes, type InputType, type ModelTypes, Selector } from '../../zeus/index'

/**
 * Сохранение приватного ключа (WIF) в зашифрованное хранилище аккаунта пользователя.
 * Соответствует полю GraphQL `Mutation.setWif`.
 */
export const name = 'setWif'

export const mutation = Selector('Mutation')({
  [name]: [{ data: $('data', 'SetWifInput!') }, true],
})

export interface IInput {
  /**
   * @private
   */
  [key: string]: unknown

  data: ModelTypes['SetWifInput']
}

export type IOutput = InputType<GraphQLTypes['Mutation'], typeof mutation> 