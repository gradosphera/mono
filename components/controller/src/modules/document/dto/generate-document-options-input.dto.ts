import { InputType, Field } from '@nestjs/graphql';
import type { Cooperative } from 'cooptypes';

@InputType('GenerateDocumentOptionsInput')
export class GenerateDocumentOptionsInputDTO implements Cooperative.Document.IGenerationOptions {
  @Field({ nullable: true, description: 'Пропустить сохранение' })
  skip_save?: boolean;
}
