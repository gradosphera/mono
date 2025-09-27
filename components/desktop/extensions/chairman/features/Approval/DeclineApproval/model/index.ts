import { useApprovalStore } from 'app/extensions/chairman/entities/Approval/model';
import { api } from '../api';
import type { IDeclineApprovalInput, IDeclineApprovalOutput } from '../api';

export function useDeclineApproval() {
  const store = useApprovalStore();

  const declineApproval = async (input: IDeclineApprovalInput): Promise<IDeclineApprovalOutput> => {
    const result = await api.declineApproval(input);

    if (result) {
      // Обновляем approval в списке (меняем статус на declined)
      store.updateApprovalInList(result);
    }

    return result;
  };

  return { declineApproval };
}
