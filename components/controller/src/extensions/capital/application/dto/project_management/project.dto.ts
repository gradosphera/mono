import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProjectStatus } from '../../../domain/enums/project-status.enum';
import { BaseOutputDTO } from '../base.dto';

/**
 * Базовый GraphQL Output DTO для сущности Project
 * Не содержит рекурсивных полей для избежания циклических зависимостей
 */
@ObjectType('BaseCapitalProject', {
  description: 'Базовый проект в системе CAPITAL',
})
export class BaseProjectOutputDTO extends BaseOutputDTO {
  @Field(() => Int, {
    nullable: true,
    description: 'ID в блокчейне',
  })
  id?: number;

  @Field(() => ProjectStatus, {
    description: 'Статус проекта',
  })
  status!: ProjectStatus;

  @Field(() => String, {
    description: 'Хеш проекта',
  })
  project_hash!: string;

  @Field(() => String, {
    nullable: true,
    description: 'Название кооператива',
  })
  coopname?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Хеш родительского проекта',
  })
  parent_hash?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Статус из блокчейна',
  })
  blockchain_status?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Открыт ли проект',
  })
  is_opened?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Запланирован ли проект',
  })
  is_planed?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Можно ли конвертировать в проект',
  })
  can_convert_to_project?: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Мастер проекта',
  })
  master?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Название проекта',
  })
  title?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Описание проекта',
  })
  description?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Мета-информация проекта',
  })
  meta?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Дата создания',
  })
  created_at?: string;

  // TODO: Добавить поля counts, plan, fact, crps, voting, membership когда будут определены соответствующие DTO
}

/**
 * GraphQL Output DTO для проекта-компонента
 * Наследуется от базового типа без дополнительных полей для избежания рекурсии
 */
@ObjectType('CapitalProjectComponent', {
  description: 'Проект-компонент в системе CAPITAL',
})
export class ProjectComponentOutputDTO extends BaseProjectOutputDTO {
  // Наследуется от BaseProjectOutputDTO без дополнительных полей
  // Это предотвращает циклические зависимости в GraphQL схеме
}

/**
 * GraphQL Output DTO для полного проекта с компонентами
 * Наследуется от базового типа и добавляет массив компонентов
 */
@ObjectType('CapitalProject', {
  description: 'Проект в системе CAPITAL с компонентами',
})
export class ProjectOutputDTO extends BaseProjectOutputDTO {
  @Field(() => [ProjectComponentOutputDTO], {
    description: 'Массив проектов-компонентов',
    defaultValue: [],
  })
  components?: ProjectComponentOutputDTO[];
}
