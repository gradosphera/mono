import { Notify } from 'quasar'
import { extractGraphQLErrorMessages } from './errors'

export function SuccessAlert(message: string): void {
  Notify.create({
    message,
    color: 'primary',
    actions: [
      { icon: 'close', color: 'white', round: true, size:'sm', flat: true, handler: () => { /* ... */ } }
    ]
  })
}

export function FailAlert(message: string): void {
  Notify.create({
    message,
    type: 'negative',
    actions: [
      { icon: 'close', color: 'white', round: true, size:'sm', flat: true, handler: () => { /* ... */ } }
    ]
  })
}

export function failAlert(error: any): void{
  const message = extractGraphQLErrorMessages(error)
  FailAlert(message)
}
