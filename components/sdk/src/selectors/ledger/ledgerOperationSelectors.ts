import type { MakeAllFieldsRequired } from '../../utils/MakeAllFieldsRequired'
import { type ModelTypes, Selector, type ValueTypes } from '../../zeus/index'

/**
 * Селектор для базовых полей операции ledger
 */
const rawLedgerOperationBaseSelector = {
  global_sequence: true,
  coopname: true,
  action: true,
  created_at: true,
}

/**
 * Селектор для операции пополнения счета (add)
 */
export const rawLedgerAddOperationSelector = {
  ...rawLedgerOperationBaseSelector,
  account_id: true,
  quantity: true,
  comment: true,
}

// Проверка валидности
const _validateAdd: MakeAllFieldsRequired<ValueTypes['LedgerAddOperation']> = rawLedgerAddOperationSelector

export type ledgerAddOperationModel = ModelTypes['LedgerAddOperation']
export const ledgerAddOperationSelector = Selector('LedgerAddOperation')(rawLedgerAddOperationSelector)

/**
 * Селектор для операции списания со счета (sub)
 */
export const rawLedgerSubOperationSelector = {
  ...rawLedgerOperationBaseSelector,
  account_id: true,
  quantity: true,
  comment: true,
}

// Проверка валидности
const _validateSub: MakeAllFieldsRequired<ValueTypes['LedgerSubOperation']> = rawLedgerSubOperationSelector

export type ledgerSubOperationModel = ModelTypes['LedgerSubOperation']
export const ledgerSubOperationSelector = Selector('LedgerSubOperation')(rawLedgerSubOperationSelector)

/**
 * Селектор для операции перевода между счетами (transfer)
 */
export const rawLedgerTransferOperationSelector = {
  ...rawLedgerOperationBaseSelector,
  from_account_id: true,
  to_account_id: true,
  quantity: true,
  comment: true,
}

// Проверка валидности
const _validateTransfer: MakeAllFieldsRequired<ValueTypes['LedgerTransferOperation']> = rawLedgerTransferOperationSelector

export type ledgerTransferOperationModel = ModelTypes['LedgerTransferOperation']
export const ledgerTransferOperationSelector = Selector('LedgerTransferOperation')(rawLedgerTransferOperationSelector)

/**
 * Селектор для операции блокировки средств (block)
 */
export const rawLedgerBlockOperationSelector = {
  ...rawLedgerOperationBaseSelector,
  account_id: true,
  quantity: true,
  comment: true,
}

// Проверка валидности
const _validateBlock: MakeAllFieldsRequired<ValueTypes['LedgerBlockOperation']> = rawLedgerBlockOperationSelector

export type ledgerBlockOperationModel = ModelTypes['LedgerBlockOperation']
export const ledgerBlockOperationSelector = Selector('LedgerBlockOperation')(rawLedgerBlockOperationSelector)

/**
 * Селектор для операции разблокировки средств (unblock)
 */
export const rawLedgerUnblockOperationSelector = {
  ...rawLedgerOperationBaseSelector,
  account_id: true,
  quantity: true,
  comment: true,
}

// Проверка валидности
const _validateUnblock: MakeAllFieldsRequired<ValueTypes['LedgerUnblockOperation']> = rawLedgerUnblockOperationSelector

export type ledgerUnblockOperationModel = ModelTypes['LedgerUnblockOperation']
export const ledgerUnblockOperationSelector = Selector('LedgerUnblockOperation')(rawLedgerUnblockOperationSelector)

/**
 * Селектор для Union типа LedgerOperation
 * Включает все возможные поля из всех типов операций
 */
export const rawLedgerOperationUnionSelector = {
  '...on LedgerAddOperation': rawLedgerAddOperationSelector,
  '...on LedgerSubOperation': rawLedgerSubOperationSelector,
  '...on LedgerTransferOperation': rawLedgerTransferOperationSelector,
  '...on LedgerBlockOperation': rawLedgerBlockOperationSelector,
  '...on LedgerUnblockOperation': rawLedgerUnblockOperationSelector,
}

export type ledgerOperationUnionModel = ModelTypes['LedgerOperation']