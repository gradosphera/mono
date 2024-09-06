import type { Cooperative } from 'cooptypes'

export type IGenerateJoinCoopDecision = Cooperative.Document.IGenerateJoinCoopDecision

/**
 * Интерфейс генерации заявления на вступление в кооператив
 */
export interface IGenerateJoinCoop extends IGenerate {
  signature: string
  skip_save: boolean
}

export type IGenerateAgreement = Cooperative.Document.IGenerateAgreement
