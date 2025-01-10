/**
 * Мутация Refresh обновляет токены доступа и возвращает новые. 
 *
 * @example
 * ```typescript

import { Mutations } from "@coopenomics/sdk";

const variables: Mutations.Auth.Refresh.IInput = {
  data: {
    access_token: 'токен_доступа';
    refresh_token: 'токен_обновления';
  }
}

const { [Mutations.Auth.Refresh.name]: result } = await client.Mutation(
  Mutations.Auth.Refresh.mutation,
  {
    variables,
  }
);
 * ```
 */
export * as Refresh from './refresh';

/**
 * Мутация Logout блокирует токены доступа и осуществляет выход пользователя из системы.
 *
 * @example
 * ```typescript

import { Mutations } from "@coopenomics/sdk";

const variables: Mutations.Auth.Logout.IInput = {
  data: {
    access_token: 'токен_доступа';
    refresh_token: 'токен_обновления';
  }
}

const { [Mutations.Auth.Logout.name]: result } = await client.Mutation(
  Mutations.Auth.Logout.mutation,
  {
    variables,
  }
);
 * ```
 */
export * as Logout from './logout'


/**
 * Мутация Login осуществляет вход в систему и возвращает токены доступа с объектом аккаунта
 *
 * @example
 * ```typescript

import { Mutations } from "@coopenomics/sdk";

const variables: Mutations.Auth.Login.IInput = {
  data: {
    "email": "email_пайщика",
    "now": "метка_времени_utc_строкой",
    "signature": "подпись_метки_времени"
  }
}

const { [Mutations.Auth.Login.name]: result } = await client.Mutation(
  Mutations.Auth.Login.mutation,
  {
    variables,
  }
);
 * ```
 */
export * as Login from './login'
