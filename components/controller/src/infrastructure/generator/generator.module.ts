// infrastructure/generator/generator.module.ts
import { Global, Module } from '@nestjs/common';
import { GeneratorInfrastructureService } from './generator.service';
import { GENERATOR_PORT } from '~/domain/document/ports/generator.port';

@Global()
@Module({
  providers: [
    GeneratorInfrastructureService,
    {
      provide: GENERATOR_PORT,
      useClass: GeneratorInfrastructureService,
    },
  ],
  exports: [GeneratorInfrastructureService, GENERATOR_PORT],
})
export class GeneratorInfrastructureModule {}
