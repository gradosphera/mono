// infrastructure/graphql/graphql.module.ts
import { Global, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import config from '~/config/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { docDirectiveTransformer } from './directives/doc.directive';
import logger from '~/config/logger';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { fieldAuthDirectiveTransformer } from './directives/fieldAuth.directive';

@Global()
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      introspection: true,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      debug: config.env !== 'production',
      // context: ({ req }) => req,
      playground: { endpoint: '/v1/graphql', settings: { 'request.credentials': 'same-origin' } },
      path: '/v1/graphql', // здесь можно задать другой путь, когда потребуется,
      transformSchema: (schema) => {
        schema = docDirectiveTransformer(schema, 'auth');
        schema = fieldAuthDirectiveTransformer(schema, 'auth');
        return schema;
      },
      // transformSchema: (schema) => docDirectiveTransformer(schema, 'auth'),
      formatError: (formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError => {
        let extensions = formattedError.extensions || {};
        let message = formattedError.message;
        console.log(formattedError);
        if (error instanceof GraphQLError) {
          // Если есть оригинальная ошибка, извлекаем информацию
          if (error.originalError instanceof Error) {
            message = error.originalError.message;
            extensions = {
              ...extensions,
              code: extensions.code || 'INTERNAL_SERVER_ERROR',
              stacktrace: process.env.NODE_ENV === 'development' ? error.originalError.stack : undefined,
            };
          }
        } else if (error instanceof Error) {
          // Для ошибок, которые не являются GraphQLError
          message = error.message;
          extensions = {
            ...extensions,
            code: 'INTERNAL_SERVER_ERROR',
            stacktrace: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          };
        }

        // Логирование
        logger.error({
          message: `GraphQL Error: ${message}`,
          extensions,
        });

        return {
          message,
          extensions,
        };
      },
    }),
  ],
  providers: [],
  exports: [GraphQLModule],
})
export class GraphqlModule {}
