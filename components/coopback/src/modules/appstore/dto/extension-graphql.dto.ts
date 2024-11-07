// modules/appstore/dto/extension-graphql.dto.ts
import { ObjectType, Field } from '@nestjs/graphql';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import type { ExtensionDomainInterface } from '~/domain/extension/interfaces/extension-domain.interface';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType('Extension')
export class ExtensionGraphQLDTO<TConfig = any> implements ExtensionDomainInterface {
  @Field({ description: 'Unique name of the extension' })
  name: string;

  @Field({ description: 'Indicates whether the extension is enabled' })
  enabled: boolean;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Configuration settings for the extension' })
  config: TConfig;

  @Field(() => Date, { description: 'Timestamp of when the extension was created' })
  created_at: Date;

  @Field(() => Date, { description: 'Timestamp of the last update to the extension' })
  updated_at: Date;

  constructor(name: string, enabled: boolean, config: TConfig, created_at: Date, updated_at: Date) {
    this.name = name;
    this.enabled = enabled;
    this.config = config;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Функция преобразования доменной сущности в GraphQL DTO
  static fromDomain(domain: ExtensionDomainEntity<any>): ExtensionGraphQLDTO<any> {
    return new ExtensionGraphQLDTO(domain.name, domain.enabled, domain.config, domain.created_at, domain.updated_at);
  }
}
