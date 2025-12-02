import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Min } from 'class-validator';

/**
 * DTO входных данных для запроса документов 1CCoop
 */
@InputType('GetOneCoopDocumentsInput')
export class GetOneCoopDocumentsInputDTO {
  @Field(() => Int, {
    description: 'Номер блока, начиная с которого извлекать документы',
  })
  @IsInt()
  @Min(0)
  block_from!: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Номер блока, до которого извлекать документы',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  block_to?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 1,
    description: 'Номер страницы для пагинации',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 100,
    description: 'Количество записей на странице',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
