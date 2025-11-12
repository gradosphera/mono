export interface ITariff {
  id: string
  name: string
  description: string
  price: string
  features: string[]
  additionalCosts?: string[]
}

export interface ICooperativeFormData {
  announce: string
  initial: string
  minimum: string
  org_initial: string
  org_minimum: string
}

export interface IConnectionAgreementState {
  currentStep: number
  selectedTariff: ITariff | null
  isInitialized: boolean
  document?: any
  signedDocument?: any
  coop?: any
  formData?: ICooperativeFormData
}
