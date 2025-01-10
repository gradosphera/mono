import { Field, InputType } from '@nestjs/graphql';
import { IsIn, ValidateNested } from 'class-validator';
import { CreateIndividualDataInputDTO } from '~/modules/account/dto/create-individual-data-input.dto';

@InputType('SovietMemberInput')
export class SovietMemberInputDTO {
  @Field(() => CreateIndividualDataInputDTO)
  @ValidateNested()
  individual_data!: CreateIndividualDataInputDTO;

  @Field(() => String)
  @IsIn(['chairman', 'member'], { message: 'Роль должна быть "chairman" или "member"' })
  role!: 'chairman' | 'member';
}
