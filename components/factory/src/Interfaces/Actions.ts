import type { Cooperative } from 'cooptypes'
import type { IGenerate } from './Documents'

export type IGenerateJoinCoopDecision = Cooperative.Document.IGenerateJoinCoopDecision

/**
 * Интерфейс генерации заявления на вступление в кооператив
 */
export interface IGenerateJoinCoop extends IGenerate {
  signature: string
  skip_save: boolean
}

export type IGenerateAgreement = Cooperative.Document.IGenerateWalletAgreement
