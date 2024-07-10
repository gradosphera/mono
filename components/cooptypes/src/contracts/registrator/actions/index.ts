/**
 * Действие верификации аккаунта
 */
export * as VerificateAccount from './verificateAccount'

/**
 * Действие обновления публичных данных аккаунта
 */
export * as UpdateAccount from './updateAccount'

/**
 * Действие создания нового аккаунта
 */
export * as CreateAccount from './createAccount'

/**
 * Действие регистрации карточки пользователя в кооперативе
 */
export * as RegisterUser from './registerUser'

/**
 * Действие регистрации карточки организации в кооперативе
 */
export * as RegisterOrganization from './registerOrganization'

/**
 * Действие замены активного ключа пользователя за подписью системного аккаунта делегатов.
 */
export * as ChangeKey from './changeKey'

/**
 * Действие подачи заявления на вступление в кооператив
 */
export * as JoinCooperative from './joinCooperative'

/**
 * Действие, которое вызывается контрактом _soviet для подтверждения заявки на вступление в кооператив после принятия советом решения.
 * @private
 */
export * as ConfirmJoin from './confirmJoin'

/**
 * Действие, которые вызывается системным контрактом для инициализации.
 * @private
 */
export * as Init from './init'
