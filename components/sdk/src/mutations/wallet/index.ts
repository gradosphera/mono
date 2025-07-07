/** Создать заявку на вывод средств */
export * as CreateWithdraw from './createWithdraw'
/** Создание объекта паевого платежа производится мутацией createDepositPayment. Выполнение мутации возвращает идентификатор платежа и данные для его совершения в зависимости от выбранного платежного провайдера. */
export * as CreateDepositPayment from './createDepositPayment'
/** Сгенерировать документ заявления на возврат паевого взноса */
export * as GenerateReturnByMoneyStatementDocument from './generateReturnByMoneyStatementDocument'
/** Сгенерировать документ решения совета о возврате паевого взноса */
export * as GenerateReturnByMoneyDecisionDocument from './generateReturnByMoneyDecisionDocument'
