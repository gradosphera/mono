import { Module } from '@nestjs/common';
import { VarsDataAdapter } from './vars-data.adapter';
import { VARS_DATA_PORT } from '~/domain/system/ports/vars-data.port';

@Module({
  providers: [
    VarsDataAdapter,
    {
      provide: VARS_DATA_PORT,
      useClass: VarsDataAdapter,
    },
  ],
  exports: [VarsDataAdapter, VARS_DATA_PORT],
})
export class SystemInfrastructureModule {}
