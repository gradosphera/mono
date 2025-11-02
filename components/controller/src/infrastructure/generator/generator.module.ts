// infrastructure/generator/generator.module.ts
import { Global, Module } from '@nestjs/common';
import { GeneratorInfrastructureService } from './generator.service';

@Global()
@Module({
  providers: [GeneratorInfrastructureService],
  exports: [GeneratorInfrastructureService],
})
export class GeneratorInfrastructureModule {}
