import { ObjectType, Field } from '@nestjs/graphql';
import type { ExtendedBlockchainActionDomainInterface } from '~/domain/agenda/interfaces/extended-blockchain-action-domain.interface';
import { BlockchainActionDTO } from '../../common/dto/blockchain-action.dto';
import { UserCertificateUnion } from '../../document/unions/user-certificate.union';
import { IndividualCertificateDTO } from '~/modules/common/dto/individual-certificate.dto';
import { EntrepreneurCertificateDTO } from '~/modules/common/dto/entrepreneur-certificate.dto';
import { OrganizationCertificateDTO } from '~/modules/common/dto/organization-certificate.dto';
import { AccountType } from '~/modules/account/enum/account-type.enum';

@ObjectType('ExtendedBlockchainAction', {
  description: 'Расширенное действие блокчейна с сертификатом пользователя, совершившего его.',
})
export class ExtendedBlockchainActionDTO extends BlockchainActionDTO implements ExtendedBlockchainActionDomainInterface {
  @Field(() => UserCertificateUnion, {
    nullable: true,
    description: 'Сертификат пользователя (сокращенная информация)',
  })
  actor_certificate?: IndividualCertificateDTO | EntrepreneurCertificateDTO | OrganizationCertificateDTO | null;

  constructor(data?: ExtendedBlockchainActionDomainInterface) {
    super();
    if (data) {
      // Копируем базовые поля из BlockchainActionDTO
      Object.assign(this, data);

      // Для actor_certificate преобразуем в нужный тип в зависимости от структуры
      if (data.actor_certificate) {
        switch (data.actor_certificate.type) {
          case AccountType.individual:
            this.actor_certificate = new IndividualCertificateDTO(data.actor_certificate);
            break;
          case AccountType.entrepreneur:
            this.actor_certificate = new EntrepreneurCertificateDTO(data.actor_certificate);
            break;
          case AccountType.organization:
            this.actor_certificate = new OrganizationCertificateDTO(data.actor_certificate);
            break;
          default:
            this.actor_certificate = null;
        }
      } else {
        this.actor_certificate = null;
      }
    }
  }
}
