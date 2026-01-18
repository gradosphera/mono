import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalTypeormEntity } from '../entities/approval-typeorm.entity';

/**
 * Модуль базы данных для расширения Chairman
 * Использует дефолтное подключение из общего TypeOrmModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([ApprovalTypeormEntity])],
  exports: [TypeOrmModule],
})
export class ChairmanDatabaseModule {}
