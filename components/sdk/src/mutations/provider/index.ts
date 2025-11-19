/**
 * Мутации для работы с провайдером
 */

/** Сгенерировать заявление на конвертацию паевого взноса в членский взнос */
export * as GenerateConvertToAxonStatement from './generateConvertToAxonStatement'

/** Обработать подписанное заявление на конвертацию и выполнить блокчейн-транзакцию */
export * as ProcessConvertToAxonStatement from './processConvertToAxonStatement'
