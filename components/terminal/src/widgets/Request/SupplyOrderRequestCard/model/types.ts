import { IRequestData } from 'src/entities/Request'

export interface IStepProps {
  iAmSupplier: boolean
  iAmAuthorizer: boolean
  iAmReciever: boolean
  currentStep: number
  username: string
  request: IRequestData
}
