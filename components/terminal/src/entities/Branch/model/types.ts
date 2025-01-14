import type { Queries } from '@coopenomics/coopjs';

export type IBranch = Queries.Branches.GetBranches.IOutput[typeof Queries.Branches.GetBranches.name][number]
export type IPublicBranch = Queries.Branches.GetPublicBranches.IOutput[typeof Queries.Branches.GetPublicBranches.name][number]

export type IGetBranchesInput = Queries.Branches.GetBranches.IInput['data']

