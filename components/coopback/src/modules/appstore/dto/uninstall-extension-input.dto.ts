// modules/appstore/dto/extension-graphql-input.dto.ts
import { InputType, Field } from '@nestjs/graphql';
import type { ExtensionDomainInterface } from '~/domain/extension/interfaces/extension-domain.interface';

@InputType('UninstallExtensionInput')
export class UninstallExtensionGraphQLInput implements Partial<ExtensionDomainInterface> {
  @Field(() => String, { description: 'Фильтр по имени' })
  name!: string;
}
