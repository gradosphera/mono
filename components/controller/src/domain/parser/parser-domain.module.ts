import { Global, Module } from '@nestjs/common';
import { ParserInteractor } from './interactors/parser.interactor';
import { BlockchainEventHandlerService } from './services/blockchain-event-handler.service';

/**
 * Доменный модуль парсера блокчейна
 * Содержит чистую бизнес-логику и доступ к инфраструктуре для репозиториев
 */
@Global()
@Module({
  imports: [],
  providers: [ParserInteractor, BlockchainEventHandlerService],
  exports: [ParserInteractor, BlockchainEventHandlerService],
})
export class ParserDomainModule {}
