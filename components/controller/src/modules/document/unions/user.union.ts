import { createUnionType } from '@nestjs/graphql';
import { EntrepreneurDTO } from '~/modules/common/dto/entrepreneur.dto';
import { IndividualDTO } from '~/modules/common/dto/individual.dto';
import { OrganizationDTO } from '~/modules/common/dto/organization.dto';

export const UserDataUnion = createUnionType({
  name: 'UserDataUnion',
  description: 'Объединение информации о пользователях',
  types: () => [IndividualDTO, EntrepreneurDTO, OrganizationDTO] as const,
  resolveType(value) {
    if (value instanceof IndividualDTO) {
      return IndividualDTO;
    }
    if (value instanceof EntrepreneurDTO) {
      return EntrepreneurDTO;
    }
    if (value instanceof OrganizationDTO) {
      return OrganizationDTO;
    }
    return null;
  },
});
