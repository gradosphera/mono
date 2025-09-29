/** Сгенерировать документ согласия с политикой конфиденциальности. */
export * as GeneratePrivacyAgreement from './generatePrivacyAgreement'

/** Сгенерировать документ соглашения о порядка и правилах использования простой электронной подписи. */
export * as GenerateSignatureAgreement from './generateSignatureAgreement'

/** Сгенерировать документ соглашения о целевой потребительской программе "Цифровой Кошелёк" */
export * as GenerateWalletAgreement from './generateWalletAgreement'

/** Сгенерировать документ пользовательского соглашения. */
export * as GenerateUserAgreement from './generateUserAgreement'

/** Отправить соглашение на рассмотрение. */
export * as SendAgreement from './sendAgreement'

/** Подтвердить соглашение администратором. */
export * as ConfirmAgreement from './confirmAgreement'

/** Отклонить соглашение администратором. */
export * as DeclineAgreement from './declineAgreement'