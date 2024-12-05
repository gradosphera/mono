import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { IsString, IsBoolean, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@ObjectType('AccountResourceInfo')
export class AccountResourceInfoDTO {
  @Field(() => String, { description: 'Использовано ресурсов' })
  @IsNumber()
  public readonly used!: string;

  @Field(() => String, { description: 'Доступные ресурсы' })
  @IsNumber()
  public readonly available!: string;

  @Field(() => String, { description: 'Максимальное количество ресурсов' })
  @IsNumber()
  public readonly max!: string;

  @Field(() => String, { description: 'Время последнего обновления использования ресурсов', nullable: true })
  @IsOptional()
  @IsString()
  public readonly last_usage_update_time?: string;

  @Field(() => String, { description: 'Текущее использование ресурсов', nullable: true })
  @IsOptional()
  @IsNumber()
  public readonly current_used?: string;
}

@ObjectType('KeyWeight')
export class KeyWeightDTO {
  @Field(() => String, { description: 'Ключ' })
  @IsString()
  public readonly key!: string;

  @Field(() => Int, { description: 'Вес' })
  @IsNumber()
  public readonly weight!: number;
}

@ObjectType('PermissionLevel')
export class PermissionLevelDTO {
  @Field(() => String, { description: 'Актор' })
  @IsString()
  public readonly actor!: string;

  @Field(() => String, { description: 'Разрешение' })
  @IsString()
  public readonly permission!: string;
}

@ObjectType('PermissionLevelWeight')
export class PermissionLevelWeightDTO {
  @Field(() => PermissionLevelDTO, { description: 'Уровень разрешения' })
  @ValidateNested()
  @Type(() => PermissionLevelDTO)
  public readonly permission!: PermissionLevelDTO;

  @Field(() => Int, { description: 'Вес' })
  @IsNumber()
  public readonly weight!: number;
}

@ObjectType('WaitWeight')
export class WaitWeightDTO {
  @Field(() => Int, { description: 'Время ожидания в секундах' })
  @IsNumber()
  public readonly wait_sec!: number;

  @Field(() => Int, { description: 'Вес' })
  @IsNumber()
  public readonly weight!: number;
}

@ObjectType('Authority')
export class AuthorityDTO {
  @Field(() => Int, { description: 'Порог' })
  @IsNumber()
  public readonly threshold!: number;

  @Field(() => [KeyWeightDTO], { description: 'Ключи' })
  @ValidateNested({ each: true })
  @Type(() => KeyWeightDTO)
  public readonly keys!: KeyWeightDTO[];

  @Field(() => [PermissionLevelWeightDTO], { description: 'Уровни разрешений' })
  @ValidateNested({ each: true })
  @Type(() => PermissionLevelWeightDTO)
  public readonly accounts!: PermissionLevelWeightDTO[];

  @Field(() => [WaitWeightDTO], { description: 'Вес ожидания' })
  @ValidateNested({ each: true })
  @Type(() => WaitWeightDTO)
  public readonly waits!: WaitWeightDTO[];
}

@ObjectType('Permission')
export class PermissionDTO {
  @Field(() => String, { description: 'Имя разрешения' })
  @IsString()
  public readonly perm_name!: string;

  @Field(() => String, { description: 'Родительское разрешение' })
  @IsString()
  public readonly parent!: string;

  @Field(() => AuthorityDTO, { description: 'Требуемые разрешения' })
  @ValidateNested()
  @Type(() => AuthorityDTO)
  public readonly required_auth!: AuthorityDTO;
}

@ObjectType('ResourceOverview')
export class ResourceOverviewDTO {
  @Field(() => String, { description: 'Владелец' })
  @IsString()
  public readonly owner!: string;

  @Field(() => Int, { description: 'Используемая RAM' })
  @IsNumber()
  public readonly ram_bytes!: number;

  @Field(() => String, { description: 'Вес сети' })
  @IsString()
  public readonly net_weight!: string;

  @Field(() => String, { description: 'Вес CPU' })
  @IsString()
  public readonly cpu_weight!: string;
}

@ObjectType()
export class ResourceDelegationDTO {
  @Field(() => String, { description: 'Отправитель' })
  @IsString()
  public readonly from!: string;

  @Field(() => String, { description: 'Получатель' })
  @IsString()
  public readonly to!: string;

  @Field(() => String, { description: 'Вес сети' })
  @IsString()
  public readonly net_weight!: string;

  @Field(() => String, { description: 'Вес CPU' })
  @IsString()
  public readonly cpu_weight!: string;
}

@ObjectType('RefundRequest')
export class RefundRequestDTO {
  @Field(() => String, { description: 'Владелец' })
  @IsString()
  public readonly owner!: string;

  @Field(() => String, { description: 'Время запроса' })
  @IsString()
  public readonly request_time!: string;

  @Field(() => String, { description: 'Сумма сети' })
  @IsString()
  public readonly net_amount!: string;

  @Field(() => String, { description: 'Сумма CPU' })
  @IsString()
  public readonly cpu_amount!: string;
}

@ObjectType('SystemAccount')
export class SystemAccountDTO {
  @Field(() => String, { description: 'Имя аккаунта' })
  @IsString()
  public readonly account_name!: string;

  @Field(() => Int, { description: 'Номер последнего блока' })
  @IsNumber()
  public readonly head_block_num!: number;

  @Field(() => String, { description: 'Время последнего блока' })
  @IsString()
  public readonly head_block_time!: string;

  @Field(() => Boolean, { description: 'Флаг привилегий' })
  @IsBoolean()
  public readonly privileged!: boolean;

  @Field(() => String, { description: 'Время последнего обновления кода' })
  @IsString()
  public readonly last_code_update!: string;

  @Field(() => String, { description: 'Дата создания' })
  @IsString()
  public readonly created!: string;

  @Field(() => String, { description: 'Баланс', nullable: true })
  @IsOptional()
  @IsString()
  public readonly core_liquid_balance?: string;

  @Field(() => Int, { description: 'Квота RAM' })
  @IsNumber()
  public readonly ram_quota!: number;

  @Field(() => String, { description: 'Вес сети' })
  @IsNumber()
  public readonly net_weight!: string;

  @Field(() => String, { description: 'Вес CPU' })
  @IsNumber()
  public readonly cpu_weight!: string;

  @Field(() => AccountResourceInfoDTO, { description: 'Ограничения сети' })
  @ValidateNested()
  @Type(() => AccountResourceInfoDTO)
  public readonly net_limit!: AccountResourceInfoDTO;

  @Field(() => AccountResourceInfoDTO, { description: 'Ограничения CPU' })
  @ValidateNested()
  @Type(() => AccountResourceInfoDTO)
  public readonly cpu_limit!: AccountResourceInfoDTO;

  @Field(() => Int, { description: 'Использование RAM' })
  @IsNumber()
  public readonly ram_usage!: number;

  @Field(() => [PermissionDTO], { description: 'Разрешения' })
  @ValidateNested({ each: true })
  @Type(() => PermissionDTO)
  public readonly permissions!: PermissionDTO[];

  @Field(() => ResourceOverviewDTO, { description: 'Общий обзор ресурсов', nullable: true })
  @ValidateNested()
  @Type(() => ResourceOverviewDTO)
  public readonly total_resources!: ResourceOverviewDTO | null;

  @Field(() => ResourceDelegationDTO, { description: 'Делегированные ресурсы', nullable: true })
  @ValidateNested()
  @Type(() => ResourceDelegationDTO)
  public readonly self_delegated_bandwidth!: ResourceDelegationDTO | null;

  @Field(() => RefundRequestDTO, { description: 'Запрос на возврат', nullable: true })
  @ValidateNested()
  @Type(() => RefundRequestDTO)
  public readonly refund_request!: RefundRequestDTO | null;

  @Field(() => String, { description: 'Информация о голосовании', nullable: true })
  @IsOptional()
  public readonly voter_info!: any;

  @Field(() => String, { description: 'Информация о REX', nullable: true })
  @IsOptional()
  public readonly rex_info!: any;
}
