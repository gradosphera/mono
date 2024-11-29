import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLInputObjectType, GraphQLSchema, type GraphQLInputFieldMap } from 'graphql';

/**
 * Рекурсивно проверяет, есть ли в GraphQLInputObjectType поле `username`.
 */
function hasUsernameField(inputType: GraphQLInputObjectType): boolean {
  const fields: GraphQLInputFieldMap = inputType.getFields();

  return Object.keys(fields).some((fieldName) => {
    if (fieldName === 'username') {
      return true;
    }
    const fieldType = fields[fieldName].type;
    if (fieldType instanceof GraphQLInputObjectType) {
      return hasUsernameField(fieldType);
    }
    return false;
  });
}

export function authDirectiveTransformer(schema: GraphQLSchema, directiveName: string) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, directiveName)?.[0];

      if (directive) {
        const originalDescription = fieldConfig.description || '';
        const authDescription = `Требуемые роли: ${directive.roles.join(', ')}`;

        // Проверяем, содержит ли тип аргумента `data` поле `username`
        const dataType = fieldConfig.args?.data?.type;
        const hasUsername = dataType instanceof GraphQLInputObjectType && hasUsernameField(dataType);

        const argumentDescription = hasUsername
          ? 'Исключение: доступ разрешен, если `data.username` совпадает с `username` текущего пользователя.'
          : '';

        // Обновляем описание поля, добавляя туда информацию о ролях
        fieldConfig.description = `${originalDescription}\n\n${authDescription}. ${argumentDescription}`;
      }

      return fieldConfig;
    },
  });
}
