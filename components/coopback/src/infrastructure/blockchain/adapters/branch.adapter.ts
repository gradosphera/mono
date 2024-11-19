import { Injectable } from '@nestjs/common';
import { BranchBlockchainPort } from '~/domain/branch/interfaces/branch-blockchain.port';
import { BlockchainService } from '../blockchain.service';
import { SovietContract } from 'cooptypes';

@Injectable()
export class BranchBlockchainAdapter implements BranchBlockchainPort {
  constructor(private readonly blockchainService: BlockchainService) {}
  async getBranches(coopname: string): Promise<SovietContract.Tables.Branches.IBranch[]> {
    return this.blockchainService.getAllRows(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Branches.tableName
    );
  }
  async getBranch(coopname: string, braname: string): Promise<SovietContract.Tables.Branches.IBranch> {
    return this.blockchainService.getSingleRow(
      SovietContract.contractName.production,
      coopname,
      SovietContract.Tables.Branches.tableName,
      braname
    );
  }
  // async registerBranch(data: { name: string; trustee: string }): Promise<any> {
  //   return this.blockchainService.transact({
  //     account: 'branch_contract',
  //     name: 'register',
  //     authorization: [{ actor: data.trustee, permission: 'active' }],
  //     data,
  //   });
  // }

  // async fetchTable(name: string, scope: string): Promise<any[]> {
  //   return this.blockchainService.getAllTableRows('branch_contract', scope, name);
  // }
}
