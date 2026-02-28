import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

@InputType('SearchDocumentsInput')
export class SearchDocumentsInputDTO {
  @Field(() => String, { description: 'Поисковый запрос' })
  @IsString()
  query!: string;

  @Field(() => Int, { description: 'Максимальное количество результатов', nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
