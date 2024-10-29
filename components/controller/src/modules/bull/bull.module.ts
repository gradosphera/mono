import { Module } from '@nestjs/common';
import { BullService } from './bull.service';
import { JobEntity } from './entities/job.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullController } from './bull.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity])],
  controllers: [BullController],
  providers: [BullService],
  exports: [BullService],
})
export class BullModule {}
