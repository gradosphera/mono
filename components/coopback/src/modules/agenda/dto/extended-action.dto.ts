import { ObjectType, Field } from '@nestjs/graphql';
import { IndividualDTO } from '~/modules/common/dto/individual.dto';
import { EntrepreneurDTO } from '~/modules/common/dto/entrepreneur.dto';
import { OrganizationDTO } from '~/modules/common/dto/organization.dto';
import type { ExtendedBlockchainActionDomainInterface } from '~/domain/agenda/interfaces/extended-blockchain-action-domain.interface';
import { BlockchainActionDTO } from './blockchain-action.dto';

@ObjectType('ExtendedBlockchainAction', {
  description: 'Расширенное действие блокчейна с персональными данными пользователя, совершившего его.',
})
export class ExtendedBlockchainActionDTO extends BlockchainActionDTO implements ExtendedBlockchainActionDomainInterface {
  @Field(() => [IndividualDTO, EntrepreneurDTO, OrganizationDTO], {
    nullable: true,
    description: 'Доп. данные о пользователе (физ/ИП/организация)',
  })
  user?: IndividualDTO | EntrepreneurDTO | OrganizationDTO | null | undefined;
}
