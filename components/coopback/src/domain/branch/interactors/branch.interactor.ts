import { BRANCH_BLOCKCHAIN_PORT, BranchBlockchainPort } from '../interfaces/branch-blockchain.port';
import type { GetBranchesDomainInput } from '../interfaces/get-branches-input.interface';
import { BranchDomainEntity } from '../entities/branch-domain.entity';
import { ORGANIZATION_REPOSITORY, OrganizationRepository } from '~/domain/common/repositories/organization.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BranchDomainInteractor {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY) private readonly organizationRepository: OrganizationRepository,
    @Inject(BRANCH_BLOCKCHAIN_PORT) private readonly branchBlockchainPort: BranchBlockchainPort
  ) {}

  async getBranches(data: GetBranchesDomainInput): Promise<BranchDomainEntity[]> {
    const branches = await this.branchBlockchainPort.getBranches(data.coopname);
    const result: BranchDomainEntity[] = [];

    for (const branch of branches) {
      const databaseData = await this.organizationRepository.findByUsername(data.coopname);

      result.push(new BranchDomainEntity(branch, databaseData));
    }

    return result;
  }

  // async createBranch(data: CreateBranchInput): Promise<BranchAggregate> {
  //   // Проверяем существование участка
  //   const existingBranch = await this.branchRepository.findByName(data.name);
  //   if (existingBranch) {
  //     throw new Error('Branch already exists');
  //   }

  //   // Сохраняем в базе данных
  //   const branch = await this.branchRepository.save(data);

  //   // Уведомляем блокчейн через порт
  //   await this.blockchainPort.registerBranch({
  //     name: branch.name,
  //     trustee: branch.trustee,
  //   });

  //   // Получаем дополнительные данные из блокчейна
  //   const blockchainDetails = await this.blockchainPort.getBranchDetails(branch.name);

  //   // Возвращаем агрегат
  //   return new BranchAggregate(branch, blockchainDetails);
  // }
}
