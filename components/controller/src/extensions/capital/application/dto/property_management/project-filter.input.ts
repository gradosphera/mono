import { InputType, Field } from '@nestjs/graphql';
import { ProjectStatus } from '../../../domain/enums/project-status.enum';

/**
 * Input DTO для фильтрации проектов
 */
@InputType('CapitalProjectFilter', {
  description: 'Параметры фильтрации для запросов проектов CAPITAL',
})
export class ProjectFilterInputDTO {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по названию кооператива',
  })
  coopname?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по мастеру проекта',
  })
  master?: string;

  @Field(() => ProjectStatus, {
    nullable: true,
    description: 'Фильтр по статусу проекта',
  })
  status?: ProjectStatus;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по хешу проекта',
  })
  project_hash?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по хешу родительского проекта',
  })
  parent_hash?: string;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Фильтр по открытому проекту',
  })
  is_opened?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Фильтр по запланированному проекту',
  })
  is_planed?: boolean;
}
