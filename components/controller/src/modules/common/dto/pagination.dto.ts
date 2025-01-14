import { Field, Int, ObjectType, InputType } from '@nestjs/graphql';

/**
 * Входные параметры для пагинации и сортировки
 */
@InputType('PaginationInput')
export class PaginationInputDTO {
  @Field(() => Int, { description: 'Номер страницы', defaultValue: 1 })
  page!: number;

  @Field(() => Int, { description: 'Количество элементов на странице', defaultValue: 10 })
  limit!: number;

  @Field(() => String, { nullable: true, description: 'Ключ сортировки (например, "name")' })
  sortBy?: string;

  @Field(() => String, {
    description: 'Направление сортировки ("ASC" или "DESC")',
    defaultValue: 'ASC',
  })
  sortOrder!: 'ASC' | 'DESC';
}

/**
 * Результат пагинации (универсальный для TypeScript)
 */
export class PaginationResult<T> {
  items!: T[];
  totalCount!: number;
  totalPages!: number;
  currentPage!: number;
}

/**
 * Создание объекта GraphQL для результата пагинации
 * @param name - Имя объекта GraphQL
 * @param ItemType - Класс элемента списка
 */
export function createPaginationResult<T>(ItemType: new (...args: any[]) => T, name: string) {
  @ObjectType(`${name}PaginationResult`, { isAbstract: true })
  abstract class PaginationResult {
    @Field(() => [ItemType], { description: 'Элементы текущей страницы' })
    items!: T[];

    @Field(() => Int, { description: 'Общее количество элементов' })
    totalCount!: number;

    @Field(() => Int, { description: 'Общее количество страниц' })
    totalPages!: number;

    @Field(() => Int, { description: 'Текущая страница' })
    currentPage!: number;
  }
  return PaginationResult;
}
