import {
  useIssueStore,
  type IDeleteIssueInput,
  type IDeleteIssueOutput,
} from 'app/extensions/capital/entities/Issue/model';
import { api } from '../api';

export function useDeleteIssue() {
  const store = useIssueStore();

  async function deleteIssue(
    data: IDeleteIssueInput,
    projectHash: string,
  ): Promise<IDeleteIssueOutput> {
    const result = await api.deleteIssue(data);

    if (result) {
      store.removeIssue(projectHash, data.issue_hash);
    }

    return result;
  }

  return { deleteIssue };
}
