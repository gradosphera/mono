import { TransactResult } from '@wharfkit/session';
import { Cooperative, SovietContract } from 'cooptypes';
import { DigitalDocument } from 'src/shared/lib/document';
import { useSessionStore } from 'src/entities/Session';
import { COOPNAME } from 'src/shared/config';
import { useGlobalStore } from 'src/shared/store';

export function useAuthorizeAndExecDecision() {
  async function authorizeAndExecDecision(
    username: string,
    decision_id: number
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    const document = await new DigitalDocument().generate<Cooperative.Registry.DecisionOfParticipantApplication.Action>({
      registry_id: Cooperative.Registry.DecisionOfParticipantApplication.registry_id,
      coopname: COOPNAME,
      username,
      lang: 'ru',
      decision_id,
    });

    if (!document) {
      throw new Error('Ошибка при генерации документа решения');
    }

    const signed_hash_of_document = useGlobalStore().signDigest(document.hash);

    const chainDocument: Cooperative.Document.IChainDocument = {
      hash: document.hash,
      meta: JSON.stringify(document.meta),
      signature: signed_hash_of_document.signature,
      public_key: signed_hash_of_document.public_key,
    };

    const authorizeData: SovietContract.Actions.Decisions.Authorize.IAuthorize =
      {
        coopname: COOPNAME,
        chairman: session.username,
        decision_id,
        document: chainDocument,
      };

    const execData: SovietContract.Actions.Decisions.Exec.IExec = {
      executer: session.username,
      coopname: COOPNAME,
      decision_id: decision_id,
    };

    const result = useGlobalStore().transact([
      {
        account: SovietContract.contractName.production,
        name: SovietContract.Actions.Decisions.Authorize.actionName,
        authorization: [
          {
            actor: session.username,
            permission: 'active',
          },
        ],
        data: authorizeData,
      },
      {
        account: SovietContract.contractName.production,
        name: SovietContract.Actions.Decisions.Exec.actionName,
        authorization: [
          {
            actor: session.username,
            permission: 'active',
          },
        ],
        data: execData,
      },
    ]);

    return result;
  }
  return { authorizeAndExecDecision };
}
