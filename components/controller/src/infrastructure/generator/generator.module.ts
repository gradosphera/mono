// infrastructure/generator/generator.module.ts
import { Module } from '@nestjs/common';
import { GeneratorInfrastructureService } from './generator.service';

@Module({
  providers: [GeneratorInfrastructureService],
  exports: [GeneratorInfrastructureService],
})
export class GeneratorInfrastructureModule {}
