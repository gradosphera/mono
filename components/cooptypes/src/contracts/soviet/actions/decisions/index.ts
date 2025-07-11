/**
 * Принимает голос "ПРОТИВ" от члена совета по повестке собрания.
 */
export * as VoteAgainst from './voteAgainst'

/**
 * Принимает голос "ПРОТИВ" от члена совета по повестке собрания.
 */
export * as VoteFor from './voteFor'

/**
 * Принимает отмену голоса. Метод позволяет члену совета отменить свой голос, если решение еще не принято.
 */
export * as CancelVote from './cancelVote'

/**
 * Действие утверждения принятого советом решения.
 */
export * as Authorize from './authorize'

/**
 * Действие исполнения принятого решения.
 * Обычно вызывается председателем сразу после утверждения решения,
 * чтобы оно вступило в силу и контракты исполнили его.
 * Однако, любой пользователь/кооператив может вызвать исполнение решения после того,
 * как оно было принято советом, если председатель по-какой-либо причине не исполнил его сам.
 */
export * as Exec from './exec'

/**
 * Действие поставляет в совет на голосование заявления на взнос и возврат взноса двух пайщиков целевой потребительской программы маркетплейса.
 * @private
 */
export * as MarketDecision from './marketDecision'

/**
 * Действие поставляет в совет на голосование заявление на возврат паевого взноса.
 * @private
 */
export * as WithdrawDecision from './withdrawDecision'

/**
 * Действие поставляет в совет на голосование документ о необходимости использования средств фондов кооператива (кроме паевого).
 * @private
 */
export * as FundWithdrawDecision from './fundWithdrawDecision'

/**
 * Действие поставляет в совет информацию о завершении процесса клиринга и инициирует выпуск закрывающих документов в реестр.
 * @private
 */
export * as ProductRecieved from './productRecieved'

/**
 * Действие валидации документов, поданных на голосование в совет.
 */
export * as Validate from './validate'

/**
 * Подключает автоматизацию принятия решений по указанным типам вопросов на повестке для члена совета.
 */
export * as Automate from './automate'

/**
 * Отключает автоматизацию принятия решений по указанным типам вопросов на повестке для члена совета.
 */
export * as Disautomate from './disautomate'

/**
 * Создаёт проект свободного решения и выносит его на голосование
 */
export * as CreateFreeDecision from './freeDecision'

/**
 * Отменяет проект решения по истечению срока
 */
export * as Cancelexprd from './cancelexprd'
