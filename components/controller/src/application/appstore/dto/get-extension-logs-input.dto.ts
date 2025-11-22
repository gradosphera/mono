// modules/appstore/dto/get-extension-logs-input.dto.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType('GetExtensionLogsInput')
export class GetExtensionLogsInputDTO {
  @Field(() => String, { description: 'Фильтр по имени расширения', nullable: true })
  name?: string;

  @Field(() => Date, { description: 'Фильтр по дате создания (от)', nullable: true })
  createdFrom?: Date;

  @Field(() => Date, { description: 'Фильтр по дате создания (до)', nullable: true })
  createdTo?: Date;
}
