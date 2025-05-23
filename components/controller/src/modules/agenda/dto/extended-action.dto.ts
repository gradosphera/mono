import { ObjectType, Field } from '@nestjs/graphql';
import { IndividualDTO } from '~/modules/common/dto/individual.dto';
import { EntrepreneurDTO } from '~/modules/common/dto/entrepreneur.dto';
import { OrganizationDTO } from '~/modules/common/dto/organization.dto';
import type { ExtendedBlockchainActionDomainInterface } from '~/domain/agenda/interfaces/extended-blockchain-action-domain.interface';
import { BlockchainActionDTO } from '../../common/dto/blockchain-action.dto';
import { UserDataUnion } from '../../document/unions/user.union';
import type { Cooperative } from 'cooptypes';

@ObjectType('ExtendedBlockchainAction', {
  description: 'Расширенное действие блокчейна с персональными данными пользователя, совершившего его.',
})
export class ExtendedBlockchainActionDTO
  extends BlockchainActionDTO
  implements ExtendedBlockchainActionDomainInterface, Cooperative.Blockchain.IExtendedAction
{
  @Field(() => UserDataUnion, {
    nullable: true,
    description: 'Доп. данные о пользователе (физ/ИП/организация)',
  })
  user?: IndividualDTO | EntrepreneurDTO | OrganizationDTO | null;

  constructor(data?: ExtendedBlockchainActionDomainInterface) {
    super();
    if (data) {
      // Копируем базовые поля из BlockchainActionDTO
      Object.assign(this, data);

      // Для user преобразуем в нужный тип в зависимости от структуры
      if (data.user) {
        if ('details' in data.user && 'inn' in data.user.details) {
          if ('short_name' in data.user) {
            this.user = new OrganizationDTO(data.user);
          } else {
            this.user = new EntrepreneurDTO(data.user);
          }
        } else if ('first_name' in data.user) {
          this.user = new IndividualDTO(data.user);
        } else {
          this.user = null;
        }
      } else {
        this.user = null;
      }
    }
  }
}
