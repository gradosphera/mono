import { createUnionType } from '@nestjs/graphql';
import { EntrepreneurDTO } from '~/modules/common/dto/entrepreneur.dto';
import { IndividualDTO } from '~/modules/common/dto/individual.dto';
import { OrganizationDTO } from '~/modules/common/dto/organization.dto';

export const UserDataUnion = createUnionType({
  name: 'UserDataUnion',
  description: 'Объединение информации о пользователях',
  types: () => [IndividualDTO, EntrepreneurDTO, OrganizationDTO] as const,
  resolveType(value) {
    // Определяем тип объекта по уникальным свойствам
    if (IndividualDTO.isTypeOf(value)) {
      return IndividualDTO;
    } else if (OrganizationDTO.isTypeOf(value)) {
      return OrganizationDTO;
    } else {
      return EntrepreneurDTO;
    }
  },
});
