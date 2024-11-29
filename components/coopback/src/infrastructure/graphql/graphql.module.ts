// infrastructure/graphql/graphql.module.ts
import { Global, HttpStatus, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import config from '~/config/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { authDirectiveTransformer } from './directives/auth.directive';
import logger from '~/config/logger';

@Global()
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      introspection: true,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      debug: config.env !== 'production',
      playground:
        config.env !== 'production'
          ? { endpoint: '/v1/graphql', settings: { 'request.credentials': 'same-origin' } }
          : false,
      path: '/v1/graphql', // здесь можно задать другой путь, когда потребуется,
      transformSchema: (schema) => authDirectiveTransformer(schema, 'auth'),
      formatError: (error) => {
        // Логирование ошибки
        // logger.warn('GraphQL Error:', error);

        return error;
      },
    }),
  ],
  providers: [],
  exports: [GraphQLModule],
})
export class GraphqlModule {}
