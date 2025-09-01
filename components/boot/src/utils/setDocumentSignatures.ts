import { fakeDocument } from '../tests/shared/fakeDocument'

/**
 * Устанавливает подписи документа на основе массива имен аккаунтов
 * @param usernames массив имен аккаунтов для подписи документа
 * @returns копия fakeDocument с установленными подписями
 */
export function setDocumentSignatures(usernames: string[]) {
  const document = JSON.parse(JSON.stringify(fakeDocument))

  // Очищаем существующие подписи
  document.signatures = []

  // Создаем подписи для каждого пользователя
  usernames.forEach((username, index) => {
    const signature = {
      id: index + 1,
      signed_hash: '157192b276da23cc84ab078fc8755c051c5f0430bf4802e55718221e6b76c777',
      signer: username,
      public_key: 'EOS5JhMfxbsNebajHcTEK8yC9uNN9Dit9hEmzE8ri8yMhhzxrLg3J',
      signature: 'SIG_K1_KmKWPBC8dZGGDGhbKEoZEzPr3h5crRrR2uLdGRF5DJbeibY1MY1bZ9sPwHsgmPfiGFv9psfoCVsXFh9TekcLuvaeuxRKA8',
      signed_at: '2025-05-14T12:22:26',
      meta: '{}',
    }
    document.signatures.push(signature)
  })

  return document
}
