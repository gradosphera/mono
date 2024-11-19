import { Injectable } from '@nestjs/common';
import { BranchGraphQLDTO } from '../dto/branch.dto';
import type { GetBranchesGraphQLInput } from '../dto/get-branches-input.dto';
import { BranchDomainInteractor } from '~/domain/branch/interactors/branch.interactor';

@Injectable()
export class BranchService {
  constructor(private readonly branchDomainInteractor: BranchDomainInteractor) {}

  public async getBranches(data: GetBranchesGraphQLInput): Promise<BranchGraphQLDTO[]> {
    // const branchAggregate = new BranchAggregate(blockchainBranch, organization);
    const branches = await this.branchDomainInteractor.getBranches(data);

    const result: BranchGraphQLDTO[] = [];

    // Преобразуем в DTO
    for (const branch of branches) {
      result.push(new BranchGraphQLDTO(branch));
    }

    return result;
  }
}
