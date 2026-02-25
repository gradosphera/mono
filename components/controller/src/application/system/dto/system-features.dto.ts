import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('SystemFeatures')
export class SystemFeaturesDTO {
  @Field(() => Boolean, { description: 'Доступен ли полнотекстовый поиск по документам' })
  search!: boolean;
}
