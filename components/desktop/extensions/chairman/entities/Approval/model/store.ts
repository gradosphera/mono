import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { IApproval, IApprovalsPagination, IGetApprovalInput, IGetApprovalsInput } from './types';

const namespace = 'approvalStore';

interface IApprovalStore {
  approvals: Ref<IApprovalsPagination | null>;
  loadApprovals: (data: IGetApprovalsInput) => Promise<void>;
  approval: Ref<IApproval | null>;
  loadApproval: (data: IGetApprovalInput) => Promise<IApproval | null | undefined>;
  removeApprovalFromList: (approvalHash: string) => void;
  updateApprovalInList: (approvalData: IApproval) => void;
}

export const useApprovalStore = defineStore(
  namespace,
  (): IApprovalStore => {
    const approvals = ref<IApprovalsPagination | null>(null);
    const approval = ref<IApproval | null>(null);

    const loadApprovals = async (
      data: IGetApprovalsInput,
    ): Promise<void> => {
      const loadedData = await api.loadApprovals(data);
      approvals.value = loadedData;
    };

    const loadApproval = async (
      data: IGetApprovalInput,
    ): Promise<IApproval> => {
      const loadedData = await api.loadApproval(data);
      approval.value = loadedData;
      return loadedData;
    };

    const removeApprovalFromList = (approvalHash: string) => {
      if (approvals.value) {
        const approvalIndex = approvals.value.items.findIndex(
          (approval) => approval.approval_hash === approvalHash,
        );

        if (approvalIndex !== -1) {
          approvals.value.items.splice(approvalIndex, 1);
          approvals.value.totalCount -= 1;
        }
      }
    };

    const updateApprovalInList = (approvalData: IApproval) => {
      if (approvals.value && approvalData) {
        const existingIndex = approvals.value.items.findIndex(
          (approval) => approval.approval_hash === approvalData.approval_hash,
        );

        if (existingIndex !== -1) {
          // Безопасное обновление с сохранением ссылки
          Object.assign(approvals.value.items[existingIndex], approvalData);
        }
      }
    };

    return {
      approvals,
      approval,
      loadApprovals,
      loadApproval,
      removeApprovalFromList,
      updateApprovalInList,
    };
  },
);
