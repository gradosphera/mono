// src/infrastructure/graphql/directives/auth.directive.ts
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

export function authDirectiveTransformer(schema: GraphQLSchema, directiveName: string) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (directive) {
        const originalDescription = fieldConfig.description || '';
        const authDescription = `Requires role(s): ${directive.roles.join(', ')}\n\n`;

        // Добавляем описание директивы в конец, сохраняя существующее описание
        fieldConfig.description = `${authDescription}${originalDescription}`;
      }
      return fieldConfig;
    },
  });
}
