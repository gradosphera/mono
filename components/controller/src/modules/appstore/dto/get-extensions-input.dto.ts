// modules/appstore/dto/extension-graphql-input.dto.ts
import { InputType, Field } from '@nestjs/graphql';
import type { IRegistryExtension } from '~/extensions/extensions.registry';

@InputType('GetExtensionsInput')
export class GetExtensionsGraphQLInput implements Partial<IRegistryExtension> {
  @Field(() => String, { description: 'Фильтр по имени', nullable: true })
  name?: string;

  @Field(() => Boolean, { description: 'Фильтр включенных расширений', nullable: true })
  enabled?: boolean;

  @Field(() => Boolean, { description: 'Фильтр установленных расширений', nullable: true })
  is_installed?: boolean;

  @Field(() => Boolean, { description: 'Фильтр рабочих столов', nullable: true })
  is_desktop?: boolean;

  @Field(() => Boolean, { description: 'Фильтр активности', nullable: true })
  is_available?: boolean;
}
