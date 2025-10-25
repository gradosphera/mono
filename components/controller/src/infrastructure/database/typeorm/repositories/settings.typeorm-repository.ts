import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsEntity } from '../entities/settings.entity';
import type { SettingsRepository } from '~/domain/settings/repositories/settings.repository';
import type { SettingsDomainInterface } from '~/domain/settings/interfaces/settings-domain.interface';
import type { UpdateSettingsInputDomainInterface } from '~/domain/settings/interfaces/update-settings-input-domain.interface';

/**
 * Реализация репозитория настроек на базе TypeORM
 * Адаптер между доменным слоем и инфраструктурой базы данных
 */
@Injectable()
export class SettingsTypeormRepository implements SettingsRepository {
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly repository: Repository<SettingsEntity>
  ) {}

  /**
   * Получает настройки кооператива
   */
  async get(coopname: string): Promise<SettingsDomainInterface | null> {
    const entity = await this.repository.findOne({ where: { coopname } });
    return entity ? entity.toDomainEntity() : null;
  }

  /**
   * Создает или обновляет настройки кооператива
   */
  async upsert(settings: SettingsDomainInterface): Promise<SettingsDomainInterface> {
    const entity = SettingsEntity.fromDomainEntity(settings as any);
    const saved = await this.repository.save(entity);
    return saved.toDomainEntity();
  }

  /**
   * Обновляет настройки кооператива частично
   */
  async update(coopname: string, updates: UpdateSettingsInputDomainInterface): Promise<SettingsDomainInterface> {
    // Получаем текущие настройки
    const existing = await this.get(coopname);
    if (!existing) {
      throw new Error(`Settings not found for coopname: ${coopname}`);
    }

    // Обновляем только переданные поля
    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date(),
    };

    return this.upsert(updated);
  }
}
