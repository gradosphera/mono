// modules/appstore/dto/extension-graphql-input.dto.ts
import { InputType, Field } from '@nestjs/graphql';
import type { ExtensionDomainInterface } from '~/domain/extension/interfaces/extension-domain.interface';
import { GraphQLJSON } from 'graphql-type-json';

@InputType('ExtensionInput')
export class ExtensionGraphQLInput<TConfig = any> implements ExtensionDomainInterface {
  @Field(() => String, { description: 'Unique name of the extension' })
  name!: string;

  @Field(() => Boolean, { description: 'Indicates whether the extension is enabled' })
  enabled!: boolean;

  @Field(() => GraphQLJSON, { description: 'Configuration settings for the extension' })
  config!: TConfig;

  @Field(() => Date, { nullable: true, description: 'Timestamp of when the extension was created' })
  created_at?: Date;

  @Field(() => Date, { nullable: true, description: 'Timestamp of the last update to the extension' })
  updated_at?: Date;
}
