import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema, defaultFieldResolver } from 'graphql';

export function fieldAuthDirectiveTransformer(schema: GraphQLSchema, directiveName: string) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (directive) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        const requiredRoles = directive.roles || [];

        fieldConfig.resolve = async function (source, args, context, info) {
          const { req } = context; // Получаем req из контекста
          const user = req?.user; // Извлекаем user из req

          if (!user) {
            throw new Error(`Пользователь не авторизован для доступа к полю "${info.fieldName}". Выполните вход.`);
          }

          // Проверяем соответствие ролей
          const hasAccess = requiredRoles.includes(user.role);

          if (!hasAccess) {
            throw new Error(
              `Недостаточно прав доступа к полю "${info.fieldName}". ` +
                `Текущая роль: "${user.role}". Требуемые роли: ${requiredRoles.join(', ')}.`
            );
          }

          return resolve(source, args, context, info);
        };
      }
      return fieldConfig;
    },
  });
}
