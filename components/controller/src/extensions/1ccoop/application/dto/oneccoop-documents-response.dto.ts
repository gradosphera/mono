import { Field, ObjectType, Int } from '@nestjs/graphql';
import { OneCoopDocumentOutputDTO } from './oneccoop-document-output.dto';

/**
 * DTO ответа с пагинацией для документов 1CCoop
 */
@ObjectType('OneCoopDocumentsResponse')
export class OneCoopDocumentsResponseDTO {
  @Field(() => [OneCoopDocumentOutputDTO], {
    description: 'Массив документов',
  })
  items!: OneCoopDocumentOutputDTO[];

  @Field(() => Int, {
    description: 'Общее количество документов',
  })
  total_count!: number;

  @Field(() => Int, {
    description: 'Общее количество страниц',
  })
  total_pages!: number;

  @Field(() => Int, {
    description: 'Текущая страница',
  })
  current_page!: number;

  @Field(() => Int, {
    description: 'Максимальный номер блока в ответе (для синхронизации)',
  })
  max_block_num!: number;
}
