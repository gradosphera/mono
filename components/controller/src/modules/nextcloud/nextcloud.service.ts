import { Injectable, Logger } from '@nestjs/common';
import { NextcloudClient } from 'nextcloud-link';
import * as fs from 'fs';
import * as path from 'path';

interface OcsNewUser {
  userid: string;
  password?: string;
  email?: string;
  displayName?: string;
  groups?: string[];
  subadmin?: string[];
  quota?: number;
  language?: string;
}

enum OcsShareType {
  user = 0,
  group = 1,
  publicLink = 3,
  federatedCloudShare = 6,
}

enum OcsSharePermissions {
  default = -1,
  read = 1,
  update = 2,
  create = 4,
  delete = 8,
  share = 16,
  all = 31,
}

@Injectable()
export class NextcloudService {
  private readonly logger = new Logger(NextcloudService.name);
  private client: NextcloudClient;

  constructor() {
    // Инициализация клиента Nextcloud
    this.client = new NextcloudClient({
      url: process.env.NEXTCLOUD_BASE_URL as string, // URL вашего Nextcloud, например 'https://your-nextcloud-instance.com'
      username: process.env.NEXTCLOUD_USERNAME, // Имя пользователя (администратор)
      password: process.env.NEXTCLOUD_PASSWORD, // Пароль или пароль приложения
    });
  }

  // Загрузка файла в Nextcloud
  async uploadFile(
    localFilePath: string,
    remoteFilePath: string,
  ): Promise<void> {
    try {
      // Чтение файла как Buffer
      const fileBuffer = fs.readFileSync(localFilePath);
      await this.client.put(remoteFilePath, fileBuffer);
      this.logger.log(`Файл загружен в Nextcloud: ${remoteFilePath}`);
    } catch (error: any) {
      this.logger.error(`Ошибка при загрузке файла: ${error.message}`);
      throw new Error(`Не удалось загрузить файл: ${error.message}`);
    }
  }

  async touchFolder(path: string): Promise<void> {
    try {
      const share = await this.client.touchFolder(path);
    } catch (error: any) {
      this.logger.error(`Ошибка при создании папки: ${error.message}`);
      throw new Error(`Не удалось создать папку: ${error.message}`);
    }
  }

  // Получение публичной ссылки на файл
  async shareFile(remoteFilePath: string): Promise<string> {
    try {
      const share = await this.client.shares.add(
        remoteFilePath,
        OcsShareType.publicLink, // 3 соответствует публичной ссылке
        undefined,
        OcsSharePermissions.read, // 1 означает только чтение
      );

      const shareUrl = share.url;

      if (!shareUrl) {
        throw new Error(`Не удалось получить ссылку на файл ${remoteFilePath}`);
      } else {
        this.logger.log(`Файл расшарен по ссылке: ${shareUrl}`);
        return shareUrl;
      }
    } catch (error: any) {
      this.logger.error(`Ошибка при шаринге файла: ${error.message}`);
      throw new Error(`Не удалось расшарить файл: ${error.message}`);
    }
  }

  // Создание нового пользователя
  async createUser(newUser: OcsNewUser): Promise<void> {
    try {
      await this.client.users.add(newUser); // Передаем объект newUser
      this.logger.log(`Пользователь ${newUser.userid} успешно создан`);
    } catch (error: any) {
      this.logger.error(`Ошибка при создании пользователя: ${error.message}`);
      throw new Error(`Не удалось создать пользователя: ${error.message}`);
    }
  }

  // Добавление пользователя в группу
  async addUserToGroup(username: string, groupName: string): Promise<void> {
    try {
      await this.client.users.addToGroup(username, groupName);
      this.logger.log(
        `Пользователь ${username} добавлен в группу ${groupName}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Ошибка при добавлении пользователя в группу: ${error.message}`,
      );
      throw new Error(
        `Не удалось добавить пользователя в группу: ${error.message}`,
      );
    }
  }

  // Создание новой группы
  async createGroup(groupName: string): Promise<void> {
    try {
      await this.client.groups.add(groupName);
      this.logger.log(`Группа ${groupName} успешно создана`);
    } catch (error: any) {
      this.logger.error(`Ошибка при создании группы: ${error.message}`);
      throw new Error(`Не удалось создать группу: ${error.message}`);
    }
  }

  // Назначение пользователя администратором группы
  async promoteUserToGroupAdmin(
    username: string,
    groupName: string,
  ): Promise<void> {
    try {
      await this.client.users.addSubAdminToGroup(username, groupName);
      this.logger.log(
        `Пользователь ${username} назначен администратором группы ${groupName}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Ошибка при назначении администратора группы: ${error.message}`,
      );
      throw new Error(
        `Не удалось назначить администратора группы: ${error.message}`,
      );
    }
  }

  // Метод для создания групповой папки с разрешениями только на чтение для всех
  async createReadOnlyGroupFolder(
    mountpoint: string,
    groupId: string,
  ): Promise<void> {
    try {
      // Создаем групповую папку и получаем её ID
      const folderId = await this.client.groupfolders.addFolder(mountpoint);
      this.logger.log(`Групповая папка ${mountpoint} создана с ID ${folderId}`);

      // Добавляем группу в папку
      await this.client.groupfolders.addGroup(folderId, groupId);
      this.logger.log(
        `Группа ${groupId} добавлена в групповую папку ${folderId}`,
      );

      // Устанавливаем разрешения только на чтение для группы
      await this.client.groupfolders.setPermissions(
        folderId,
        groupId,
        OcsSharePermissions.read,
      );
      this.logger.log(
        `Установлены разрешения только на чтение для группы ${groupId} в папке ${folderId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Ошибка при создании групповой папки: ${error.message}`,
      );
      throw new Error(`Не удалось создать групповую папку: ${error.message}`);
    }
  }

  // Метод для создания групповой папки с полными разрешениями для всех участников
  async createFullAccessGroupFolder(
    mountpoint: string,
    groupId: string,
  ): Promise<void> {
    try {
      // Создаем групповую папку и получаем её ID
      const folderId = await this.client.groupfolders.addFolder(mountpoint);
      this.logger.log(`Групповая папка ${mountpoint} создана с ID ${folderId}`);

      // Добавляем группу в папку
      await this.client.groupfolders.addGroup(folderId, groupId);
      this.logger.log(
        `Группа ${groupId} добавлена в групповую папку ${folderId}`,
      );

      // Устанавливаем полные разрешения для группы
      await this.client.groupfolders.setPermissions(
        folderId,
        groupId,
        OcsSharePermissions.all,
      );
      this.logger.log(
        `Установлены полные разрешения для группы ${groupId} в папке ${folderId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Ошибка при создании групповой папки: ${error.message}`,
      );
      throw new Error(`Не удалось создать групповую папку: ${error.message}`);
    }
  }
}
