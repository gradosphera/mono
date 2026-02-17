import { Module, forwardRef } from '@nestjs/common';
import { CandidateDataAdapter } from './candidate-data.adapter';
import { CANDIDATE_DATA_PORT } from '~/domain/registration/ports/candidate-data.port';
import { RegistrationModule } from '~/application/registration/registration.module';

@Module({
  imports: [forwardRef(() => RegistrationModule)],
  providers: [
    CandidateDataAdapter,
    {
      provide: CANDIDATE_DATA_PORT,
      useClass: CandidateDataAdapter,
    },
  ],
  exports: [CANDIDATE_DATA_PORT],
})
export class RegistrationInfrastructureModule {}
