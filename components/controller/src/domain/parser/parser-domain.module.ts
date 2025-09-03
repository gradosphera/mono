import { Module } from '@nestjs/common';
import { ParserInteractor } from './interactors/parser.interactor';

/**
 * Доменный модуль парсера блокчейна
 * Содержит чистую бизнес-логику без зависимостей от инфраструктуры
 */
@Module({
  providers: [ParserInteractor],
  exports: [ParserInteractor],
})
export class ParserDomainModule {}
