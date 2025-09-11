import { InputType, Field } from '@nestjs/graphql';
import { ContributorStatus } from '../../../domain/enums/contributor-status.enum';

/**
 * Input DTO для фильтрации вкладчиков
 */
@InputType('CapitalContributorFilter', {
  description: 'Параметры фильтрации для запросов вкладчиков CAPITAL',
})
export class ContributorFilterInputDTO {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по названию кооператива',
  })
  coopname?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по имени пользователя',
  })
  username?: string;

  @Field(() => ContributorStatus, {
    nullable: true,
    description: 'Фильтр по статусу вкладчика',
  })
  status?: ContributorStatus;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по хешу вкладчика',
  })
  contributor_hash?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Фильтр по наличию внешнего контракта',
  })
  is_external_contract?: boolean;
}
