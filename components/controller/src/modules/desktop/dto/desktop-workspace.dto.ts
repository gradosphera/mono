import { ObjectType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import type { DesktopWorkspaceDomainInterface } from '~/domain/desktop/interfaces/desktop-workspace-domain.interface';

@ObjectType('DesktopWorkspace')
export class DesktopWorkspaceDTO implements DesktopWorkspaceDomainInterface {
  @Field(() => String, { description: 'Имя приложения' })
  @IsString()
  public readonly name!: string;

  @Field(() => String, { description: 'Отображаемое название приложения' })
  @IsString()
  public readonly title!: string;
}
