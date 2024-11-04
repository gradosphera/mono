// migration.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoEntity } from './modules/mongo/mongo.entity'; // Замена на реальную Mongo модель
import { PostgresEntity } from './modules/postgres/postgres.entity'; // Замена на реальную Postgres модель

@Injectable()
export class MigratorService {
  constructor(
    @InjectModel(MongoEntity.name) private readonly mongoModel: Model<MongoEntity>,
    @InjectRepository(PostgresEntity) private readonly postgresRepository: Repository<PostgresEntity>
  ) {}

  async migrateData() {
    // Получаем данные из MongoDB
    const mongoData = await this.mongoModel.find().exec();

    // Переносим данные в PostgreSQL
    for (const data of mongoData) {
      const postgresData = this.postgresRepository.create(data);
      await this.postgresRepository.save(postgresData);
    }
  }
}
