import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GeneratedDocumentDTO } from '../dto/generated-document.dto';

@Resolver(() => GeneratedDocumentDTO)
export class DocumentResolver {}
