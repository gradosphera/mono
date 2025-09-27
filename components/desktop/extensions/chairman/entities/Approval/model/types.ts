import type { Queries } from '@coopenomics/sdk';

export type IApproval =
  Queries.Chairman.GetApproval.IOutput[typeof Queries.Chairman.GetApproval.name];
export type IApprovalsPagination =
  Queries.Chairman.GetApprovals.IOutput[typeof Queries.Chairman.GetApprovals.name];

export type IGetApprovalInput =
  Queries.Chairman.GetApproval.IInput;
export type IGetApprovalsInput = Queries.Chairman.GetApprovals.IInput;
