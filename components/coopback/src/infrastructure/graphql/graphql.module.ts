// infrastructure/graphql/graphql.module.ts
import { Global, HttpStatus, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import config from '~/config/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { authDirectiveTransformer } from './directives/auth.directive';

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
      // formatError: (error) => {
      //   const graphQLFormattedError = {
      //     message: error.message || 'Internal server error',
      //     extensions: {
      //       code: error.extensions?.code || HttpStatus.INTERNAL_SERVER_ERROR,
      //       ...(process.env.NODE_ENV === 'development' && { stacktrace: error.extensions }),
      //     },
      //   };

      //   // Логирование ошибки
      //   console.error('GraphQL Error:', graphQLFormattedError);

      //   return graphQLFormattedError;
      // },
    }),
  ],
  providers: [],
  exports: [GraphQLModule],
})
export class GraphqlModule {}
