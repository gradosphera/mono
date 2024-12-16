import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Equals, IsInt, IsString } from 'class-validator';
import { Cooperative } from 'cooptypes';
import { MetaDocumentDTO } from '~/modules/document/dto/meta-document.dto';

@ObjectType('SelectBranchMetaDocument')
export class SelectBranchMetaDocumentDTO
  extends MetaDocumentDTO
  implements Cooperative.Registry.SelectBranchStatement.Action
{
  @Field({ description: 'Имя аккаунта кооперативного участка' })
  @IsString()
  braname!: string;

  @Field(() => Int, { description: 'ID документа в реестре' })
  @IsInt()
  @Equals(Cooperative.Registry.SelectBranchStatement.registry_id, {
    message: `registry_id должно быть равно ${Cooperative.Registry.SelectBranchStatement.registry_id}`,
  })
  registry_id = Cooperative.Registry.SelectBranchStatement.registry_id;
}
