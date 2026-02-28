export interface ITariff {
  id: string
  name: string
  description: string
  features: string[]
  price: string
  additionalCosts?: string[]
}
