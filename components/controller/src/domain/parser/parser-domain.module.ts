import { Module } from '@nestjs/common';
import { ParserInteractor } from './interactors/parser.interactor';
import { BlockchainEventHandlerService } from './services/blockchain-event-handler.service';

/**
 * Доменный модуль парсера блокчейна
 * Содержит чистую бизнес-логику без зависимостей от инфраструктуры
 */
@Module({
  providers: [ParserInteractor, BlockchainEventHandlerService],
  exports: [ParserInteractor, BlockchainEventHandlerService],
})
export class ParserDomainModule {}
