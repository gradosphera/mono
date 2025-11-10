export interface ITariff {
  id: string
  name: string
  description: string
  price: string
  features: string[]
  additionalCosts?: string[]
}

export interface IConnectionAgreementState {
  currentStep: number
  selectedTariff: ITariff | null
  isInitialized: boolean
  document?: any
  signedDocument?: any
}