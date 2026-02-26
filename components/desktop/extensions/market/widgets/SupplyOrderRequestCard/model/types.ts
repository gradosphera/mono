import { IRequestData } from 'app/extensions/market/entities/Request'

export interface IStepProps {
  iAmSupplier: boolean
  iAmAuthorizer: boolean
  iAmReciever: boolean
  currentStep: number
  username: string
  request: IRequestData
}
