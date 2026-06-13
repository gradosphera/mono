import { Module } from '@nestjs/common';
import { MembershipExitResolver } from './resolvers/membership-exit.resolver';
import { MembershipExitService } from './services/membership-exit.service';
import { ParticipantModule } from '../participant/participant.module';

/**
 * Модуль выхода пайщика из кооператива: генерация документов выхода (200/201),
 * подача заявления (registrator::exitcoop) и предрасчёт суммы возврата паевого.
 *
 * Порты ACCOUNT_BLOCKCHAIN_PORT / BLOCKCHAIN_PORT / USER_WALLET_REPOSITORY
 * предоставляются глобальными модулями (blockchain.module, typeorm.module).
 */
@Module({
  imports: [ParticipantModule],
  providers: [MembershipExitResolver, MembershipExitService],
  exports: [MembershipExitService],
})
export class MembershipExitModule {}
