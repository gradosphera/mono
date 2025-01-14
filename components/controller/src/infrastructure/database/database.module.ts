// infrastructure/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from './typeorm/typeorm.module';
import { GeneratorRepositoriesModule } from './generator-repositories/generator-repositories.module';

@Module({
  imports: [TypeOrmModule, GeneratorRepositoriesModule],
  exports: [TypeOrmModule, GeneratorRepositoriesModule],
})
export class DatabaseModule {}
