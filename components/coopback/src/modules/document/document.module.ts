import { Module } from '@nestjs/common';
import { DomainModule } from '~/domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class DocumentModule {}
