/**
 * Юнит-тесты L3-гейта в InvestsManagementService (Эпик 3.1).
 *
 * Покрывают:
 *   (a) createProjectInvest без подписи 'generator' → ForbiddenException;
 *   (b) createProjectInvest с подписью 'generator' → передаёт управление
 *       investsManagementInteractor.createProjectInvest;
 *   (c) createProgramInvest без подписи 'blagorost' → ForbiddenException;
 *   (d) createProgramInvest с подписью 'blagorost' → передаёт управление
 *       investsManagementInteractor.createProgramInvest;
 *   (e) hasSigned для другой пары coopname/username не разрешает вход
 *       (cross-user isolation).
 *
 * Внутренние утилиты (CurrencyValidationUtil, verifySignedDocumentAgainstStoredDraft)
 * вызовутся ПОСЛЕ assertSignedOffer и им потребуется валидный input,
 * иначе они выкинут до того, как мы проверим интерактор. Поэтому в
 * сценариях с подписью мокаем их через jest.spyOn модулей.
 */

import { ForbiddenException } from '@nestjs/common';
import { InvestsManagementService } from '~/extensions/capital/application/services/invests-management.service';

jest.mock('~/utils/signed-document-draft-verification.util', () => ({
  verifySignedDocumentAgainstStoredDraft: jest.fn(async () => undefined),
}));
jest.mock('~/utils/currency-validation.util', () => ({
  CurrencyValidationUtil: { validateCurrencySymbol: jest.fn(() => undefined) },
}));
jest.mock('~/utils/generate-hash.util', () => ({
  generateRandomHash: jest.fn(() => 'fake-hash'),
}));

function makeInteractorStub() {
  return {
    createProjectInvest: jest.fn(async () => ({ transaction_id: 'tx-project' } as any)),
    createProgramInvest: jest.fn(async () => ({ transaction_id: 'tx-program' } as any)),
  } as any;
}

function makeDocInteractorStub() {
  return { getDocumentByHash: jest.fn() } as any;
}

function makeSignaturePortStub(signed: Record<string, boolean>) {
  return {
    hasSigned: jest.fn(async (coopname: string, username: string, type: string) =>
      Boolean(signed[`${coopname}::${username}::${type}`])
    ),
  } as any;
}

const projectInvestInput = {
  coopname: 'voskhod',
  amount: '100.0000 RUB',
  project_hash: '0xabc',
  statement: { hash: 'sig', signer: 'pubkey' },
} as any;

const programInvestInput = {
  coopname: 'voskhod',
  amount: '100.0000 RUB',
  statement: { hash: 'sig', signer: 'pubkey' },
} as any;

const user = { username: 'alice' } as any;

describe('InvestsManagementService L3 gate', () => {
  it('createProjectInvest без подписи generator → ForbiddenException', async () => {
    const port = makeSignaturePortStub({});
    const interactor = makeInteractorStub();
    const service = new InvestsManagementService(interactor, makeDocInteractorStub(), port);

    await expect(service.createProjectInvest(projectInvestInput, user)).rejects.toBeInstanceOf(
      ForbiddenException
    );
    expect(interactor.createProjectInvest).not.toHaveBeenCalled();
  });

  it('createProjectInvest с подписью generator → передаёт управление интерактору', async () => {
    const port = makeSignaturePortStub({ 'voskhod::alice::generator': true });
    const interactor = makeInteractorStub();
    const service = new InvestsManagementService(interactor, makeDocInteractorStub(), port);

    const result = await service.createProjectInvest(projectInvestInput, user);

    expect(interactor.createProjectInvest).toHaveBeenCalledTimes(1);
    expect((result as any).transaction_id).toBe('tx-project');
  });

  it('createProgramInvest без подписи blagorost → ForbiddenException', async () => {
    const port = makeSignaturePortStub({});
    const interactor = makeInteractorStub();
    const service = new InvestsManagementService(interactor, makeDocInteractorStub(), port);

    await expect(service.createProgramInvest(programInvestInput, user)).rejects.toBeInstanceOf(
      ForbiddenException
    );
    expect(interactor.createProgramInvest).not.toHaveBeenCalled();
  });

  it('createProgramInvest с подписью blagorost → передаёт управление интерактору', async () => {
    const port = makeSignaturePortStub({ 'voskhod::alice::blagorost': true });
    const interactor = makeInteractorStub();
    const service = new InvestsManagementService(interactor, makeDocInteractorStub(), port);

    const result = await service.createProgramInvest(programInvestInput, user);

    expect(interactor.createProgramInvest).toHaveBeenCalledTimes(1);
    expect((result as any).transaction_id).toBe('tx-program');
  });

  it('подпись другого пайщика не открывает доступ alice (cross-user isolation)', async () => {
    const port = makeSignaturePortStub({ 'voskhod::bob::blagorost': true });
    const interactor = makeInteractorStub();
    const service = new InvestsManagementService(interactor, makeDocInteractorStub(), port);

    await expect(service.createProgramInvest(programInvestInput, user)).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });
});
