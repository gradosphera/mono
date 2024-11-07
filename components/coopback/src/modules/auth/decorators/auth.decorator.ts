import { SetMetadata, applyDecorators } from '@nestjs/common';
import { Directive } from '@nestjs/graphql';

export function AuthRoles(roles: string[]): MethodDecorator & ClassDecorator {
  return applyDecorators(
    SetMetadata('roles', roles), // Устанавливаем метаданные для RolesGuard
    Directive(`@auth(roles: ${JSON.stringify(roles)})`) // Добавляем директиву для документации
  );
}
