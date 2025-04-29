import { Injectable } from '@nestjs/common';
import { BranchDTO } from '../dto/branch.dto';
import type { GetBranchesGraphQLInput } from '../dto/get-branches-input.dto';
import { BranchDomainInteractor } from '~/domain/branch/interactors/branch.interactor';
import type { EditBranchGraphQLInput } from '../dto/edit-branch-input.dto';
import type { CreateBranchGraphQLInput } from '../dto/create-branch-input.dto';
import type { DeleteBranchGraphQLInput } from '../dto/delete-branch-input.dto';
import type { AddTrustedAccountGraphQLInput } from '../dto/add-trusted-account-input.dto';
import type { DeleteTrustedAccountGraphQLInput } from '../dto/delete-trusted-account-input.dto';
import type { SelectBranchInputDTO } from '../dto/select-branch-input.dto';
import type { GenerateDocumentOptionsInputDTO } from '~/modules/document/dto/generate-document-options-input.dto';
import type { SelectBranchGenerateDocumentInputDTO } from '../../document/documents-dto/select-branch-document.dto';
import type { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';

@Injectable()
export class BranchService {
  constructor(private readonly branchDomainInteractor: BranchDomainInteractor) {}

  public async getBranches(data: GetBranchesGraphQLInput): Promise<BranchDTO[]> {
    const branches = await this.branchDomainInteractor.getBranches(data);

    const result: BranchDTO[] = [];

    // Преобразуем в DTO
    for (const branch of branches) {
      result.push(new BranchDTO(branch));
    }

    return result;
  }

  public async createBranch(data: CreateBranchGraphQLInput): Promise<BranchDTO> {
    const branch = await this.branchDomainInteractor.createBranch(data);

    return new BranchDTO(branch);
  }

  public async editBranch(data: EditBranchGraphQLInput): Promise<BranchDTO> {
    const branch = await this.branchDomainInteractor.editBranch(data);
    return new BranchDTO(branch);
  }

  public async deleteBranch(data: DeleteBranchGraphQLInput): Promise<boolean> {
    const deleted = await this.branchDomainInteractor.deleteBranch(data);

    return deleted;
  }

  public async addTrustedAccount(data: AddTrustedAccountGraphQLInput): Promise<BranchDTO> {
    const branch = await this.branchDomainInteractor.addTrustedAccount(data);
    return new BranchDTO(branch);
  }

  public async deleteTrustedAccount(data: DeleteTrustedAccountGraphQLInput): Promise<BranchDTO> {
    const branch = await this.branchDomainInteractor.deleteTrustedAccount(data);
    return new BranchDTO(branch);
  }

  public async selectBranch(data: SelectBranchInputDTO): Promise<boolean> {
    const selected = await this.branchDomainInteractor.selectBranch(data);
    return selected;
  }

  public async generateSelectBranchDocument(
    data: SelectBranchGenerateDocumentInputDTO,
    options: GenerateDocumentOptionsInputDTO
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.branchDomainInteractor.generateSelectBranchDocument(data, options);
    //TODO чтобы избавиться от unknown необходимо строго типизировать ответ фабрики документов
    return document as unknown as GeneratedDocumentDTO;
  }
}
