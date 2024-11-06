// domain/appstore/appstore-domain.module.ts

import { Module } from '@nestjs/common';
import { AppStoreDomainInteractor } from './interactors/appstore-domain.interactor';
import { AppStoreDomainService } from './services/appstore-domain.service';
import { APP_REPOSITORY } from './repositories/appstore-domain.repository.interface'; // Интерфейс репозитория
import { TypeOrmAppStoreDomainRepository } from '~/infrastructure/database/typeorm/repositories/typeorm-app.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppEntity } from '~/infrastructure/database/typeorm/entities/app.entity';
import { AppLifecycleDomainService } from '~/domain/appstore/services/app-lifecycle-domain.service';
import { AppLifecycleDomainInteractor } from './interactors/app-lifecycle-domain.interactor';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppEntity]), // Подключаем ORM-сущность для работы с TypeORM
  ],
  providers: [
    AppStoreDomainInteractor,
    AppStoreDomainService,
    AppLifecycleDomainInteractor,
    AppLifecycleDomainService,
    {
      provide: APP_REPOSITORY,
      useClass: TypeOrmAppStoreDomainRepository, // Используем инфраструктурный репозиторий для доступа к базе данных
    },
  ],
  exports: [AppStoreDomainInteractor, AppStoreDomainService], // Экспортируем интерактор и сервис для использования в других модулях
})
export class AppStoreDomainModule {
  constructor(
    private readonly appLifecycleDomainInteractor: AppLifecycleDomainInteractor,
    private readonly appStoreDomainInteractor: AppStoreDomainInteractor
  ) {}

  async onModuleInit() {
    await this.appStoreDomainInteractor.installDefaultApps();
    await this.appLifecycleDomainInteractor.runApps();
  }
}
