import { Module } from '@nestjs/common';
import { ParserInteractor } from './interactors/parser.interactor';
import { BlockchainEventHandlerService } from './services/blockchain-event-handler.service';
import { InfrastructureModule } from '~/infrastructure/infrastructure.module';

/**
 * Доменный модуль парсера блокчейна
 * Содержит чистую бизнес-логику и доступ к инфраструктуре для репозиториев
 */
@Module({
  imports: [InfrastructureModule],
  providers: [ParserInteractor, BlockchainEventHandlerService],
  exports: [ParserInteractor, BlockchainEventHandlerService],
})
export class ParserDomainModule {}
