import { Field, ObjectType } from '@nestjs/graphql';
import { IsArray, ValidateNested } from 'class-validator';
import { GeneratedDocumentDTO } from './generated-document.dto';
import type { DocumentAggregateDomainInterface } from '~/domain/document/interfaces/document-domain-aggregate.interface';
import { SignedDigitalDocumentDTO } from './signed-digital-document.dto';

@ObjectType('DocumentAggregate')
export class DocumentAggregateDTO implements DocumentAggregateDomainInterface {
  @Field(() => String)
  hash!: string;

  @Field(() => [SignedDigitalDocumentDTO])
  @IsArray()
  @ValidateNested({ each: true })
  signatures!: SignedDigitalDocumentDTO[];

  @Field(() => GeneratedDocumentDTO, { nullable: true })
  rawDocument?: GeneratedDocumentDTO;
}
