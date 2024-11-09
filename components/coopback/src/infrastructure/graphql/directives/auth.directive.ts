import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

export function authDirectiveTransformer(schema: GraphQLSchema, directiveName: string) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, directiveName)?.[0];

      if (directive) {
        const originalDescription = fieldConfig.description || '';
        const authDescription = `Required role(s): ${directive.roles.join(', ')}\n\n`;

        // Обновляем описание поля, добавляя туда информацию о ролях
        fieldConfig.description = `${authDescription}${originalDescription}`;
      }

      return fieldConfig;
    },
  });
}
