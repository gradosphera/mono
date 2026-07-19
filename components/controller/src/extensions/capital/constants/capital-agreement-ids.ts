/**
 * Идентификаторы оферт и программ расширения Capital.
 *
 * Это локальный source-of-truth для строковых значений, которые
 * расширение регистрирует в платформенном AgreementRegistry
 * (см. register-capital-in-agreement-registry.ts).
 *
 * До Эпика 1.3 эти же значения дублируются в ядре в виде
 * `AgreementId.{BLAGOROST_OFFER,GENERATOR_OFFER}` и
 * `AgreementType.{CAPITAL,GENERATOR}`. После Эпика 1.3 ядерные
 * enum-записи будут удалены, а Capital — единственный их носитель.
 *
 * `*_PROGRAM_KEY` — ключи программ онбординга, приходящие в
 * `AgreementRegistry.registerProgram({ key })`. Значения совпадают
 * со строками ядерного `ProgramKey` enum (GENERATION/CAPITALIZATION),
 * чтобы consumers, сравнивающие `data.program_key` через
 * `ProgramKey.X`, работали без преобразований.
 */

export const CAPITAL_EXTENSION_NAME = 'capital';

export const GENERATOR_OFFER_AGREEMENT_ID = 'generator_offer';
export const BLAGOROST_OFFER_AGREEMENT_ID = 'blagorost_offer';

export const GENERATOR_AGREEMENT_TYPE = 'generator';
// On-chain имя оферты Благорост в `soviet::coagreements` — 'blagorost' (program_id=4),
// как сеет boot/src/init/cooperative.ts createPrograms() при генезисе кооператива.
// Значение здесь ОБЯЗАНО совпадать буквально — иначе account.adapter.ts не находит
// coagreement по type, программный signagree подменяется на sndagreement и
// `get_coagreement_or_fail` падает с «Соглашение указанного типа не найдено»
// (воспроизведено 2026-07-19: регистрация участника Благорост падала на приёме платежа).
export const BLAGOROST_AGREEMENT_TYPE = 'blagorost';

export const GENERATION_PROGRAM_KEY = 'GENERATION';
export const CAPITALIZATION_PROGRAM_KEY = 'CAPITALIZATION';
