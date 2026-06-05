import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PAYMENT_REPOSITORY, PaymentRepository } from '~/domain/gateway/repositories/payment.repository';
import { CANDIDATE_REPOSITORY, CandidateRepository } from '~/domain/account/repository/candidate.repository';
import { PaymentStatusEnum } from '~/domain/gateway/enums/payment-status.enum';
import { PaymentTypeEnum, PaymentDirectionEnum } from '~/domain/gateway/enums/payment-type.enum';
import type { PaymentDomainInterface } from '~/domain/gateway/interfaces/payment-domain.interface';
import type { ActionDomainInterface } from '~/domain/parser/interfaces/action-domain.interface';
import { generateUniqueHash } from '~/utils/generate-hash.util';

/**
 * Заводит исходящий платёж-возврат при отказе совета в приёме пайщика.
 *
 * Отказ приходит on-chain как registrator::declinereg — он срабатывает и при
 * истечении срока повестки, и при отрицательном консенсусе (>50% совета против,
 * PR #94), через общую decline-callback ветку.
 *
 * На момент отказа взнос по фондам НЕ разносился (confirmreg не было), но реальные
 * деньги пайщика уже у кооператива на расчётном счёте. Поэтому заводим исходящий
 * платёж в реестр, чтобы кассир вернул вступительный + мин.паевой. Возврат —
 * чистая off-chain запись: подтверждение кассиром не делает on-chain проводок
 * (см. gateway.interactor.processOutgoingPayment), отклонить такой возврат нельзя.
 */
@Injectable()
export class RegistrationDeclineListener {
  private readonly logger = new Logger(RegistrationDeclineListener.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: PaymentRepository,
    @Inject(CANDIDATE_REPOSITORY) private readonly candidateRepository: CandidateRepository,
  ) {}

  @OnEvent('action::registrator::declinereg')
  async onDeclineRegistration(action: ActionDomainInterface): Promise<void> {
    const registration_hash = action?.data?.registration_hash as string | undefined;
    if (!registration_hash) return;

    const candidate = await this.candidateRepository.findByRegistrationHash(registration_hash);
    if (!candidate) {
      this.logger.warn(`declinereg: кандидат по registration_hash=${registration_hash} не найден — пропуск возврата`);
      return;
    }

    // Исходный вступительный платёж — источник суммы и номера (№ в QR = hash8).
    const original = await this.paymentRepository.findLatestByUsernameAndType(
      candidate.username,
      PaymentTypeEnum.REGISTRATION,
    );
    if (!original) {
      this.logger.warn(`declinereg: исходный регистрационный платёж для ${candidate.username} не найден — пропуск возврата`);
      return;
    }

    // Идемпотентность: повторный приход события (replay/форк) не плодит возвраты.
    const existingRefund = await this.paymentRepository.findLatestByUsernameAndType(
      candidate.username,
      PaymentTypeEnum.REGISTRATION_REFUND,
    );
    if (existingRefund) {
      this.logger.debug(`declinereg: возврат для ${candidate.username} уже существует (${existingRefund.id}) — пропуск`);
      return;
    }

    const now = new Date();
    const refund: PaymentDomainInterface = {
      id: '',
      coopname: candidate.coopname || original.coopname,
      username: candidate.username,
      quantity: original.quantity,
      symbol: original.symbol,
      type: PaymentTypeEnum.REGISTRATION_REFUND,
      direction: PaymentDirectionEnum.OUTGOING,
      // Совет уже решил (отказ) — повторная авторизация не нужна, платёж сразу
      // готов к выплате кассиром (PENDING виден кассиру и имеет кнопку «Подтвердить»).
      status: PaymentStatusEnum.PENDING,
      // Назначение переиспользует номер из QR исходного взноса (первые 8 символов
      // хэша платежа — тот же № показывался пайщику при оплате).
      memo: `Возврат вступительного и мин.паевого взноса №${original.hash.slice(0, 8)}`,
      provider: original.provider,
      secret: generateUniqueHash(),
      hash: generateUniqueHash(),
      expired_at: undefined, // бессрочный — как и прочие исходящие платежи
      created_at: now,
      updated_at: now,
    };

    const created = await this.paymentRepository.create(refund);
    this.logger.log(
      `declinereg: создан возврат ${created.id} для ${candidate.username} на ${original.quantity} ${original.symbol}`,
    );
  }
}
