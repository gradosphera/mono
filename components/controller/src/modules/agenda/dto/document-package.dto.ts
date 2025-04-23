import { ObjectType, Field } from '@nestjs/graphql';
import { GeneratedDocumentDTO } from '~/modules/document/dto/generated-document.dto';
import { StatementDetailDTO } from './statement-detail.dto';
import { DecisionDetailDTO } from './decision-detail.dto';
import { ActDetailDTO } from './act-detail.dto';
import type { DocumentPackageDomainInterface } from '~/domain/agenda/interfaces/document-package-domain.interface';

@ObjectType('DocumentPackage', {
  description:
    'Комплексный объект папки цифрового документа, который включает в себя заявление, решение, акты и связанные документы',
})
export class DocumentPackageDTO implements DocumentPackageDomainInterface {
  @Field(() => StatementDetailDTO, {
    description: 'Объект цифрового документа заявления',
    nullable: true,
  })
  statement!: StatementDetailDTO | null;

  @Field(() => DecisionDetailDTO, {
    description: 'Объект цифрового документа решения',
    nullable: true,
  })
  decision!: DecisionDetailDTO | null;

  // Здесь будет объединение документов актов, когда они появятся.
  @Field(() => [ActDetailDTO], {
    description: 'Массив объект(ов) актов, относящихся к заявлению',
  })
  acts!: ActDetailDTO[];

  // Здесь может быть объединение документов, если когда-либо потом в ссылках мы будем использовать не базовый интерфейсы генерации (IGenerate)
  @Field(() => [GeneratedDocumentDTO], {
    description: 'Массив связанных документов, извлечённых из мета-данных',
  })
  links!: GeneratedDocumentDTO[];
}
