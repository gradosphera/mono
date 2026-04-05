// Расхождение updated_at: индекс vs свежий ответ API → throw.

export class BlagoConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BlagoConflictError'
  }
}

export function assertSameRemoteVersion(localIndexIso: string, serverIso: string, entityLabel: string): void {
  if (localIndexIso !== serverIso) {
    throw new BlagoConflictError(
      `Конфликт для ${entityLabel}: на сервере другая версия (updated_at). Выполните «blago pull», разрешите расхождения и повторите push.`,
    )
  }
}
