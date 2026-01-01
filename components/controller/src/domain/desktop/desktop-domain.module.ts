import { Module } from '@nestjs/common';
import { ExtensionDomainModule } from '../extension/extension-domain.module';

@Module({
  imports: [ExtensionDomainModule],
  providers: [],
  exports: [],
})
export class DesktopDomainModule {}
