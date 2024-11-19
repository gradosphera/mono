import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BranchService } from '../services/branch.service';
import { GetBranchesGraphQLInput } from '../dto/get-branches-input.dto';
import { BranchGraphQLDTO } from '../dto/branch.dto';

@Resolver(() => BranchGraphQLDTO)
export class BranchResolver {
  constructor(private readonly branchService: BranchService) {}

  @Query(() => [BranchGraphQLDTO], {
    name: 'getBranches',
    description: 'Получить список кооперативных участков',
  })
  async getBranches(
    @Args('data', { type: () => GetBranchesGraphQLInput }) data: GetBranchesGraphQLInput
  ): Promise<BranchGraphQLDTO[]> {
    return this.branchService.getBranches(data);
  }

  // @Mutation(() => ExtensionGraphQLDTO, { name: 'createBranch', description: 'Создать кооперативный участок' })
  // @UseGuards(GqlJwtAuthGuard, RolesGuard)
  // @AuthRoles(['chairman'])
  // async createBranch(
  //   @Args('data', { type: () => ExtensionGraphQLInput }) data: ExtensionGraphQLInput
  // ): Promise<ExtensionGraphQLDTO<TConfig>> {
  //   return this.branchService.createBranch(data);
  // }

  // @Mutation(() => ExtensionGraphQLDTO, { name: 'editBranch', description: 'Обновить кооперативный участок' })
  // @UseGuards(GqlJwtAuthGuard, RolesGuard)
  // @AuthRoles(['chairman'])
  // async editBranch(
  //   @Args('data', { type: () => ExtensionGraphQLInput }) data: ExtensionGraphQLInput
  // ): Promise<ExtensionGraphQLDTO<TConfig>> {
  //   return this.branchService.editBranch(data);
  // }

  // @Mutation(() => ExtensionGraphQLDTO, { name: 'deleteBranch', description: 'Удалить кооперативный участок' })
  // @UseGuards(GqlJwtAuthGuard, RolesGuard)
  // @AuthRoles(['chairman'])
  // async deleteBranch(
  //   @Args('data', { type: () => ExtensionGraphQLInput }) data: ExtensionGraphQLInput
  // ): Promise<ExtensionGraphQLDTO<TConfig>> {
  //   return this.branchService.deleteBranch(data);
  // }

  // @Mutation(() => ExtensionGraphQLDTO, {
  //   name: 'addTrustedPerson',
  //   description: 'Добавить доверенное лицо кооперативного участка',
  // })
  // @UseGuards(GqlJwtAuthGuard, RolesGuard)
  // @AuthRoles(['chairman'])
  // async addTrustedPerson(
  //   @Args('data', { type: () => ExtensionGraphQLInput }) data: ExtensionGraphQLInput
  // ): Promise<ExtensionGraphQLDTO<TConfig>> {
  //   return this.branchService.addTrustedPerson(data);
  // }

  // @Mutation(() => ExtensionGraphQLDTO, {
  //   name: 'deleteTrustedPerson',
  //   description: 'Удалить доверенное лицо кооперативного участка',
  // })
  // @UseGuards(GqlJwtAuthGuard, RolesGuard)
  // @AuthRoles(['chairman'])
  // async deleteTrustedPerson(
  //   @Args('data', { type: () => ExtensionGraphQLInput }) data: ExtensionGraphQLInput
  // ): Promise<ExtensionGraphQLDTO<TConfig>> {
  //   return this.branchService.deleteTrustedPerson(data);
  // }
}
