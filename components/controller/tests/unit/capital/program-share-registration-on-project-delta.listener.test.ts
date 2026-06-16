/**
 * Unit-тесты ProgramShareRegistrationOnProjectDeltaListener.
 *
 * Фокус — гейтинг: доли регистрируются СРАЗУ при появлении проекта в статусе
 * pending|active, и только в своём кооперативе. На present=false, чужой scope и
 * статусы вне pending|active реакции нет (regshare там всё равно отклонится).
 */

import config from '~/config/config';
import { ProgramShareRegistrationOnProjectDeltaListener } from '~/extensions/capital/application/listeners/program-share-registration-on-project-delta.listener';
import { ProjectStatus } from '~/extensions/capital/domain/enums/project-status.enum';
import type { IDelta } from '~/types/common';

const PROJECT_HASH = '011bcd92cc6fc6c3fbac1aa31e5ab302590993fedb666642a5bd2f88e96e6a0e';

function makeServiceStub() {
  return { syncProgramSharesForProject: jest.fn(async () => undefined) } as any;
}

function makeListener(service: any) {
  return new ProgramShareRegistrationOnProjectDeltaListener(service);
}

function makeDelta(overrides: Partial<IDelta> = {}, value: Record<string, any> = {}): IDelta {
  return {
    present: true,
    scope: config.coopname,
    value: { project_hash: PROJECT_HASH, status: ProjectStatus.PENDING, ...value },
    ...overrides,
  } as IDelta;
}

describe('ProgramShareRegistrationOnProjectDeltaListener', () => {
  it('pending в своём кооперативе → регистрирует доли по project_hash', async () => {
    const service = makeServiceStub();
    await makeListener(service).handleProjectDelta(makeDelta());
    expect(service.syncProgramSharesForProject).toHaveBeenCalledWith(config.coopname, PROJECT_HASH);
  });

  it('active → тоже регистрирует', async () => {
    const service = makeServiceStub();
    await makeListener(service).handleProjectDelta(makeDelta({}, { status: ProjectStatus.ACTIVE }));
    expect(service.syncProgramSharesForProject).toHaveBeenCalledTimes(1);
  });

  it('result → не реагирует (окно закрыто, откат статуса контракт не даёт)', async () => {
    const service = makeServiceStub();
    await makeListener(service).handleProjectDelta(makeDelta({}, { status: ProjectStatus.RESULT }));
    expect(service.syncProgramSharesForProject).not.toHaveBeenCalled();
  });

  it('present=false → не реагирует', async () => {
    const service = makeServiceStub();
    await makeListener(service).handleProjectDelta(makeDelta({ present: false }));
    expect(service.syncProgramSharesForProject).not.toHaveBeenCalled();
  });

  it('чужой кооператив (scope) → не реагирует', async () => {
    const service = makeServiceStub();
    await makeListener(service).handleProjectDelta(makeDelta({ scope: 'othercoop' }));
    expect(service.syncProgramSharesForProject).not.toHaveBeenCalled();
  });

  it('ошибка сервиса не пробрасывается (best-effort, бэкстоп — scheduler)', async () => {
    const service = { syncProgramSharesForProject: jest.fn(async () => { throw new Error('boom'); }) } as any;
    await expect(makeListener(service).handleProjectDelta(makeDelta())).resolves.toBeUndefined();
  });
});
