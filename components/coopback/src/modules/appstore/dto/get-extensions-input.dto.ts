// modules/appstore/dto/extension-graphql-input.dto.ts
import { InputType, Field } from '@nestjs/graphql';
import type { ExtensionDomainInterface } from '~/domain/extension/interfaces/extension-domain.interface';

@InputType('GetExtensionsInput')
export class GetExtensionsGraphQLInput implements Partial<ExtensionDomainInterface> {
  @Field(() => String, { description: 'Фильтр по имени', nullable: true })
  name!: string;

  @Field(() => Boolean, { description: 'Фильтр включенных расширений', nullable: true })
  enabled!: boolean;

  @Field(() => Boolean, { description: 'Фильтр установленных расширений', nullable: true })
  installed!: boolean;
}
