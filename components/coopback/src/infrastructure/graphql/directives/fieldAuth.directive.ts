import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema, defaultFieldResolver } from 'graphql';
import config from '~/config/config';

export function fieldAuthDirectiveTransformer(schema: GraphQLSchema, directiveName: string) {
  const queryTypeName = schema.getQueryType()?.name;
  const mutationTypeName = schema.getMutationType()?.name;
  const subscriptionTypeName = schema.getSubscriptionType()?.name;

  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig, fieldName, typeName) => {
      // Пропускаем поля, принадлежащие корневым типам Query, Mutation, Subscription
      if (typeName === queryTypeName || typeName === mutationTypeName || typeName === subscriptionTypeName) {
        return fieldConfig;
      }

      const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (directive) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        const requiredRoles = directive.roles || [];
        fieldConfig.resolve = async function (source, args, context, info) {
          const { req } = context;

          // Проверяем наличие server-secret
          if (req.headers['server-secret'] === config.server_secret) {
            return resolve(source, args, context, info);
          }

          const user = req?.user;
          if (!user) {
            throw new Error(`Пользователь не авторизован для доступа к полю "${info.fieldName}". Выполните вход.`);
          }

          // Проверка соответствия ролей
          const hasAccess = requiredRoles.includes(user.role);
          if (!hasAccess) {
            throw new Error(
              `Недостаточно прав доступа к полю "${info.fieldName}". Требуемые роли: ${requiredRoles.join(', ')}.`
            );
          }

          return resolve(source, args, context, info);
        };
      }

      return fieldConfig;
    },
  });
}
