import { ObjectType, Field } from '@nestjs/graphql';
import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { DesktopDomainInterface } from '~/domain/desktop/interfaces/desktop-domain.interface';
import { DesktopWorkspaceDTO } from './desktop-workspace.dto';

@ObjectType('Desktop')
export class DesktopDTO implements DesktopDomainInterface {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  @IsString()
  public readonly coopname!: string;

  @Field(() => String, { description: 'Имя шаблона рабочих столов' })
  @IsString()
  public readonly layout!: string;

  @Field(() => String, { description: 'Имя шаблона рабочих столов' })
  @IsString()
  public readonly authorizedHome!: string;

  @Field(() => String, { description: 'Имя шаблона рабочих столов' })
  @IsString()
  public readonly nonAuthorizedHome!: string;

  @Field(() => [DesktopWorkspaceDTO], { description: 'Состав приложений рабочего стола' })
  @ValidateNested({ each: true })
  @Type(() => DesktopWorkspaceDTO)
  public readonly workspaces!: DesktopWorkspaceDTO[];
}
