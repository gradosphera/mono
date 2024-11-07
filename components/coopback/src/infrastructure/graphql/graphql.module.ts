// infrastructure/graphql/graphql.module.ts
import { Global, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import config from '~/config/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { authDirectiveTransformer } from './directives/auth.directive';

@Global()
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      debug: config.env !== 'production',
      playground:
        config.env !== 'production' ? { endpoint: '/graphql', settings: { 'request.credentials': 'same-origin' } } : false,
      path: '/graphql', // здесь можно задать другой путь, когда потребуется,
      transformSchema: (schema) => authDirectiveTransformer(schema, 'auth'),
    }),
  ],
  providers: [],
  exports: [GraphQLModule],
})
export class GraphqlModule {}
