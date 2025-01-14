// modules/appstore/dto/create-branch-graphql-input.dto.ts
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import type { EditBranchDomainInput } from '~/domain/branch/interfaces/edit-branch-domain-input.interface';

@InputType('EditBranchInput')
export class EditBranchGraphQLInput implements EditBranchDomainInput {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Имя аккаунта кооперативного участка' })
  braname!: string;

  @Field(() => String, { description: 'Имя аккаунта уполномоченного (председателя) кооперативного участка' })
  trustee!: string;

  @Field(() => String, { description: 'Краткое имя организации кооперативного участка' })
  short_name!: string;

  @Field(() => String, { description: 'Полное имя организации кооперативного участка' })
  full_name!: string;

  @Field(() => String, {
    description: 'Документ, на основании которого действует Уполномоченный (решение совета №СС-.. от ..)',
  })
  @IsNotEmpty({ message: 'Документ, на основании которого действует Упомолноченный, должен быть заданы' })
  based_on!: string;

  @Field(() => String, { description: 'Фактический адрес' })
  fact_address!: string;

  @Field(() => String, { description: 'Телефон' })
  phone!: string;

  @Field(() => String, { description: 'Электронная почта' })
  email!: string;
}
