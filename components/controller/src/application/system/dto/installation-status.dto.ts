import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { OrganizationWithBankAccountDTO } from '~/application/common/dto/organization.dto';

@InputType('GetInstallationStatusInput')
export class GetInstallationStatusInputDTO {
  @Field(() => String, { description: 'Код установки' })
  install_code!: string;
}

@ObjectType('InstallationStatus')
export class InstallationStatusDTO {
  @Field(() => Boolean, { description: 'Есть ли приватный аккаунт' })
  has_private_account!: boolean;

  @Field(() => OrganizationWithBankAccountDTO, {
    nullable: true,
    description: 'Данные организации с банковскими реквизитами',
  })
  organization_data!: OrganizationWithBankAccountDTO | null;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Инициализация выполнена через сервер',
    defaultValue: false,
  })
  init_by_server?: boolean;

  constructor(data?: Partial<InstallationStatusDTO>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
