// src/modules/nextcloud/nextcloud.module.ts

import { Module } from '@nestjs/common';
import { NextcloudService } from './nextcloud.service';

@Module({
  providers: [NextcloudService],
  exports: [NextcloudService],
})
export class NextcloudModule {}
