import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IApproval,
  IApprovalsPagination,
  IGetApprovalInput,
  IGetApprovalsInput,
} from '../model';

async function loadApprovals(
  data: IGetApprovalsInput,
): Promise<IApprovalsPagination> {
  const { [Queries.Chairman.GetApprovals.name]: output } = await client.Query(
    Queries.Chairman.GetApprovals.query,
    {
      variables: data,
    },
  );
  return output;
}

async function loadApproval(
  data: IGetApprovalInput,
): Promise<IApproval> {
  const { [Queries.Chairman.GetApproval.name]: output } = await client.Query(
    Queries.Chairman.GetApproval.query,
    {
      variables: data,
    },
  );
  return output;
}

export const api = {
  loadApprovals,
  loadApproval,
};
