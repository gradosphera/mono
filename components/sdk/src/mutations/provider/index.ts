/**
 * Мутации для работы с провайдером
 */

/** Генерирует заявление на конвертацию паевого взноса в членский взнос */
export * as GenerateConvertToAxonStatement from './generateConvertToAxonStatement'

/** Обрабатывает подписанное заявление на конвертацию и выполняет блокчейн-транзакцию */
export * as ProcessConvertToAxonStatement from './processConvertToAxonStatement'
