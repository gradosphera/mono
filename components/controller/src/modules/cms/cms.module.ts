// src/cms/cms.module.ts
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CmsController } from './controllers/cms.controller';

@Module({
  controllers: [CmsController],
})
export class CmsModule {}
