import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('StartInstallResult')
export class StartInstallResultDTO {
  @Field(() => String, { description: 'Код установки для дальнейших операций' })
  install_code!: string;

  @Field(() => String, { description: 'Имя кооператива' })
  coopname!: string;

  constructor(data?: Partial<StartInstallResultDTO>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
