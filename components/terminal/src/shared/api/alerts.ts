import { Notify } from 'quasar'

export function SuccessAlert(message: string): void {
  Notify.create({
    message,
    type: 'positive',
  })
}

export function FailAlert(message: string): void {
  Notify.create({
    message,
    type: 'negative',
  })
}
