import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { Ledger2 } from 'cooptypes';
import {
  LEDGER2_STATE_PORT,
  type Ledger2StatePort,
} from '~/domain/ledger2/ports/ledger2-state.port';
import {
  LEDGER2_BLOCKCHAIN_PORT,
  type Ledger2BlockchainPort,
} from '~/domain/ledger2/ports/ledger2-blockchain.port';
import type { Ledger2AccountDTO } from '../dto/ledger2-account.dto';
import type { Ledger2WalletDTO } from '../dto/ledger2-wallet.dto';
import type {
  Ledger2HistoryResponseDTO,
  Ledger2OperationDTO,
} from '../dto/ledger2-operation.dto';
import type { GetLedger2HistoryInputDTO } from '../dto/get-ledger2-history-input.dto';
import type { WalmoveInputDTO } from '../dto/walmove-input.dto';
import type { RevertOperationInputDTO } from '../dto/revert-input.dto';
import type { Ledger2AdjustmentResultDTO } from '../dto/ledger2-adjustment-result.dto';

/** WalletOp enum (числовое представление, как в контракте). */
const WALLET_OP_CODE: Record<NonNullable<Ledger2.WalletOp>, number> = {
  ISSUE: 0,
  TRANSFER: 1,
  BLOCK: 2,
  UNBLOCK: 3,
  WALLET_ONLY: 4,
  REVOKE: 5,
};

@Injectable()
export class Ledger2Service {
  constructor(
    @Inject(LEDGER2_STATE_PORT) private readonly port: Ledger2StatePort,
    @Inject(LEDGER2_BLOCKCHAIN_PORT) private readonly blockchainPort: Ledger2BlockchainPort,
  ) {}

  async getAccounts(coopname: string): Promise<Ledger2AccountDTO[]> {
    return this.port.getAccounts(coopname);
  }

  async getWallets(coopname: string): Promise<Ledger2WalletDTO[]> {
    return this.port.getWallets(coopname);
  }

  async getHistory(input: GetLedger2HistoryInputDTO): Promise<Ledger2HistoryResponseDTO> {
    const resp = await this.port.getHistory(input);
    const items: Ledger2OperationDTO[] = resp.items.map((op) => ({
      globalSequence: String(op.globalSequence),
      blockNum: op.blockNum,
      coopname: op.coopname,
      action: op.action,
      operationCode: op.operationCode,
      processHash: op.processHash,
      username: op.username,
      accountId: op.accountId,
      walletFrom: op.walletFrom,
      walletTo: op.walletTo,
      quantity: op.quantity,
      memo: op.memo,
      createdAt: op.createdAt,
    }));
    return {
      items,
      totalCount: resp.totalCount,
      totalPages: resp.totalPages,
      currentPage: resp.currentPage,
    };
  }

  /**
   * Перевод между кошельками одного бух.счёта (operation `o.adj.walmove`).
   *
   * Backend проверяет связь wallet→account через `Ledger2.LEDGER2_OPERATION_REGISTRY`:
   * для каждого кошелька выводит уникальный `account_id` (debit или credit), куда он
   * привязан в стандартных операциях. Если у двух кошельков разные account_id —
   * отказ ДО подписания (контракт связь не хранит, эта проверка — только здесь).
   */
  async walmove(input: WalmoveInputDTO): Promise<Ledger2AdjustmentResultDTO> {
    if (input.fromWallet === input.toWallet) {
      throw new BadRequestException('walmove: from_wallet и to_wallet не должны совпадать');
    }
    const fromAccountId = this.resolveWalletAccountId(input.fromWallet);
    const toAccountId = this.resolveWalletAccountId(input.toWallet);
    if (fromAccountId === null || toAccountId === null) {
      throw new BadRequestException(
        `walmove: не удалось определить account_id для кошельков ${input.fromWallet} / ${input.toWallet}`,
      );
    }
    if (fromAccountId !== toAccountId) {
      throw new BadRequestException(
        `walmove: from_wallet и to_wallet принадлежат разным бух.счетам (${fromAccountId} ≠ ${toAccountId}). ` +
          `Перевод между разными счетами требует Manual-корректировки через решение совета (отложено).`,
      );
    }

    const processHash = this.generateProcessHash();
    const result = await this.blockchainPort.walmove({
      coopname: input.coopname,
      initiator: input.coopname,
      username: input.username,
      fromWallet: input.fromWallet,
      toWallet: input.toWallet,
      quantity: input.quantity,
      processHash,
      memo: input.memo,
    });

    return {
      processHash,
      transactionId: this.extractTransactionId(result),
    };
  }

  /**
   * Откат операции (operation `o.adj.rev`).
   *
   * Поднимает оригинал по `originalGlobalSequence`, по operation_code из cooptypes
   * берёт wallet_op/wallet_from/wallet_to/debit/credit, формирует **зеркальные**
   * параметры (swap Dr/Cr, swap wallet_from/to, ISSUE → REVOKE) и подписывает revert.
   */
  async revertOperation(input: RevertOperationInputDTO): Promise<Ledger2AdjustmentResultDTO> {
    const original = await this.port.getOperationByGlobalSequence(
      input.coopname,
      input.originalGlobalSequence,
    );
    if (!original) {
      throw new NotFoundException(
        `revertOperation: операция с globalSequence=${input.originalGlobalSequence} не найдена для coopname=${input.coopname}`,
      );
    }
    if (original.action !== 'apply') {
      throw new BadRequestException(
        `revertOperation: можно откатывать только apply-операции, передан action=${original.action}`,
      );
    }
    if (!original.operationCode) {
      throw new BadRequestException('revertOperation: у оригинала отсутствует operation_code');
    }
    if (original.operationCode.startsWith('o.mig.')) {
      throw new BadRequestException(
        'revertOperation: откат миграционных операций (o.mig.*) запрещён — используйте walmove или ручную корректировку через совет',
      );
    }
    if (Ledger2.isAdjustmentOperation(original.operationCode)) {
      throw new BadRequestException(
        'revertOperation: повторный откат отката работает только через прямой revert следующего уровня — UI должен передавать globalSequence обратной операции',
      );
    }
    if (!original.quantity) {
      throw new BadRequestException('revertOperation: у оригинала отсутствует quantity');
    }
    if (!original.username) {
      throw new BadRequestException('revertOperation: у оригинала отсутствует username');
    }

    const meta = Ledger2.getOperationMeta(original.operationCode);
    if (!meta || meta.kind === 'adjustment') {
      throw new BadRequestException(
        `revertOperation: operation_code=${original.operationCode} не описан в LEDGER2_OPERATION_REGISTRY как стандартная операция`,
      );
    }
    if (meta.wallet_op === 'BLOCK' || meta.wallet_op === 'UNBLOCK') {
      throw new BadRequestException(
        'revertOperation: BLOCK/UNBLOCK не подлежат откату через revert (они симметричны сами себе — выполните парный UNBLOCK/BLOCK напрямую)',
      );
    }

    const mirror = this.computeMirrorParams(meta);
    const processHash = this.generateProcessHash();

    const result = await this.blockchainPort.revert({
      coopname: input.coopname,
      initiator: input.coopname,
      originalOperationId: original.globalSequence,
      originalOperationCode: original.operationCode,
      username: original.username,
      quantity: original.quantity,
      mirrorWalletOp: mirror.walletOp,
      mirrorWalletFrom: mirror.walletFrom,
      mirrorWalletTo: mirror.walletTo,
      mirrorDebitAccountId: mirror.debitAccountId,
      mirrorCreditAccountId: mirror.creditAccountId,
      processHash,
      memo: input.memo,
    });

    return {
      processHash,
      transactionId: this.extractTransactionId(result),
    };
  }

  /**
   * Привязка кошелька к бух.счёту по `LEDGER2_OPERATION_REGISTRY`:
   * берём первую стандартную операцию, где этот wallet появляется как
   * wallet_from или wallet_to, и возвращаем соответствующий счёт (credit для
   * wallet_from, debit для wallet_to — для standard-flow). Все стандартные
   * кошельки имеют **один** account_id во всех операциях, поэтому первая
   * найденная привязка достаточна.
   */
  private resolveWalletAccountId(walletId: number): number | null {
    for (const op of Ledger2.LEDGER2_OPERATION_REGISTRY) {
      if (op.kind === 'adjustment') continue;
      if (op.wallet_op === 'WALLET_ONLY') continue; // у WALLET_ONLY нет debit/credit
      if (op.wallet_from === walletId && op.credit !== null) return op.credit;
      if (op.wallet_to === walletId && op.credit !== null && op.wallet_op === 'ISSUE') return op.credit;
      if (op.wallet_to === walletId && op.debit !== null) return op.debit;
      if (op.wallet_from === walletId && op.debit !== null) return op.debit;
    }
    // Кошельки, которые встречаются только в WALLET_ONLY (например 9001 в o.cap.invest)
    // — выводим из источника: WALLET_ONLY переносит между кошельками одного счёта,
    // значит партнёрский кошелёк по WALLET_ONLY имеет тот же account_id, что и
    // его пара в стандартной операции.
    for (const op of Ledger2.LEDGER2_OPERATION_REGISTRY) {
      if (op.wallet_op !== 'WALLET_ONLY' || op.kind === 'adjustment') continue;
      if (op.wallet_from === walletId && op.wallet_to !== null) {
        return this.resolveWalletAccountId(op.wallet_to);
      }
      if (op.wallet_to === walletId && op.wallet_from !== null) {
        return this.resolveWalletAccountId(op.wallet_from);
      }
    }
    return null;
  }

  /**
   * Зеркало проводки: swap Dr/Cr и (для wallet_op) swap wallet_from/wallet_to.
   *
   * **Соглашение**: в TS-реестре `meta.debit/credit` хранится короткий код плана
   * счетов (51, 80, 86, ...), а контракт `ledger2::accounts.id` использует
   * `code × 1000` (51000, 80000, 86000). При вызове action revert backend
   * передаёт **уже ×1000** значения, чтобы контрактный
   * `ledger2_find_account_meta(account_id)` нашёл запись в `LEDGER2_ACCOUNT_MAP`.
   */
  private computeMirrorParams(meta: Ledger2.OperationMeta): {
    walletOp: number;
    walletFrom: number;
    walletTo: number;
    debitAccountId: number;
    creditAccountId: number;
  } {
    const accountId = (code: number | null) => (code ? code * 1000 : 0);
    if (meta.wallet_op === 'ISSUE') {
      // Зеркало ISSUE = REVOKE: убрать с wallet_to (источник денег).
      return {
        walletOp: WALLET_OP_CODE.REVOKE,
        walletFrom: meta.wallet_to ?? 0,
        walletTo: 0,
        debitAccountId: accountId(meta.credit),
        creditAccountId: accountId(meta.debit),
      };
    }
    if (meta.wallet_op === 'TRANSFER') {
      return {
        walletOp: WALLET_OP_CODE.TRANSFER,
        walletFrom: meta.wallet_to ?? 0,
        walletTo: meta.wallet_from ?? 0,
        debitAccountId: accountId(meta.credit),
        creditAccountId: accountId(meta.debit),
      };
    }
    if (meta.wallet_op === 'WALLET_ONLY') {
      return {
        walletOp: WALLET_OP_CODE.WALLET_ONLY,
        walletFrom: meta.wallet_to ?? 0,
        walletTo: meta.wallet_from ?? 0,
        debitAccountId: 0,
        creditAccountId: 0,
      };
    }
    throw new BadRequestException(
      `revertOperation: wallet_op=${meta.wallet_op} не поддерживается revert'ом`,
    );
  }

  /**
   * SHA-256 hex для process_hash. Используем 32 случайных байта (без block-pin'а),
   * этого достаточно для уникальности — в blockchain_actions.process_hash
   * хранится как hex ровно длиной 64.
   */
  private generateProcessHash(): string {
    return createHash('sha256').update(randomBytes(32)).digest('hex');
  }

  private extractTransactionId(result: unknown): string {
    if (result && typeof result === 'object' && 'transaction_id' in result) {
      const tx = (result as { transaction_id?: unknown }).transaction_id;
      if (typeof tx === 'string') return tx;
    }
    if (result && typeof result === 'object' && 'response' in result) {
      const resp = (result as { response?: { transaction_id?: unknown } }).response;
      if (resp && typeof resp.transaction_id === 'string') return resp.transaction_id;
    }
    return '';
  }
}
