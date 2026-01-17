import { useApprovalStore } from 'app/extensions/chairman/entities/Approval/model';
import { api } from '../api';
import type { IConfirmApprovalOutput } from '../api';
import { useSignDocument } from 'src/shared/lib/document/model/entity';
import { useSessionStore } from 'src/entities/Session/model';
import type { IDocumentAggregate } from 'src/entities/Document/model';

export function useConfirmApproval() {
  const store = useApprovalStore();
  const { signDocument } = useSignDocument();
  const { username } = useSessionStore();

  const confirmApproval = async ( coopname: string, approvalHash: string, approved_document: IDocumentAggregate ): Promise<IConfirmApprovalOutput> => {
    if (!approved_document.rawDocument) {
      throw new Error('Документ не найден');
    }

    // Подписываем документ второй подписью
    const doubleSignedDocument = await signDocument(
      approved_document.rawDocument,
      username,
      2, // signatureId = 2 для второй подписи
      [approved_document.document],
    );

    const result = await api.confirmApproval({
      coopname,
      approval_hash: approvalHash.toLowerCase(),
      approved_document: doubleSignedDocument,
    });

    if (result) {
      // Обновляем approval в списке (меняем статус на approved)
      store.updateApprovalInList(result);
    }

    return result;
  };

  return { confirmApproval };
}
