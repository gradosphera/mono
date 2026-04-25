/**
 * Helper для интеграционных тестов revert (operation `o.adj.rev`).
 *
 * Откат ранее проведённой apply-операции по `globalSequence`. Backend поднимает
 * оригинал из БД, готовит зеркальные параметры (swap Dr/Cr, ISSUE → REVOKE,
 * swap wallet_from/to для TRANSFER) и подписывает `ledger2::revert` ключом
 * председателя из vault.
 *
 * Запрет на `o.mig.*` валидируется backend'ом.
 */

import { gql, type LoginResult } from '../shared/apiClient'

interface RevertResponse {
  revertOperation: { processHash: string; transactionId: string }
}

const REVERT_MUTATION = `mutation($i:RevertOperationInput!){
  revertOperation(input:$i){ processHash transactionId }
}`

export async function revertOperation(
  login: LoginResult,
  coopname: string,
  originalGlobalSequence: string,
  memo: string,
): Promise<{ processHash: string; transactionId: string }> {
  const data = await gql<RevertResponse>(login.token, REVERT_MUTATION, {
    i: { coopname, originalGlobalSequence, memo },
  })
  return {
    processHash: data.revertOperation.processHash,
    transactionId: data.revertOperation.transactionId,
  }
}

/**
 * Полнотекстовое сообщение об ошибке мутации revertOperation. Используется
 * в негативных тестах (запрет o.mig.*, валидация коэффициентов и т.п.) —
 * вместо try/catch с проверкой `(err as Error).message`.
 */
export async function revertOperationExpectError(
  login: LoginResult,
  coopname: string,
  originalGlobalSequence: string,
  memo: string,
): Promise<string> {
  try {
    await revertOperation(login, coopname, originalGlobalSequence, memo)
  } catch (e) {
    return (e as Error).message
  }
  return ''
}
