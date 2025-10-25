import axios, { AxiosInstance } from 'axios';
import { 
  Types,
  Workflows 
} from '../index';

export interface NovuSyncConfig {
  apiKey: string;
  apiUrl: string;
}

export class NovuSyncService {
  private readonly client: AxiosInstance;
  private readonly config: NovuSyncConfig;

  constructor(config: NovuSyncConfig) {
    this.config = config;

    if (!this.config.apiKey) {
      throw new Error('NOVU_API_KEY is required');
    }

    if (!this.config.apiUrl) {
      throw new Error('NOVU_API_URL is required');
    }
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Authorization': `ApiKey ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Получить информацию о воркфлоу
   */
  async getWorkflow(workflowId: string): Promise<any> {
    try {
      const response = await this.client.get(`/v2/workflows/${workflowId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Получить список всех воркфлоу
   */
  async getAllWorkflows(): Promise<any[]> {
    try {
      const response = await this.client.get('/v2/workflows', {
        params: {
          limit: 10000
        }
      });
      
      return response.data.data.workflows || [];
    } catch (error: any) {
      console.error('Ошибка получения списка воркфлоу:', console.dir(error.response?.data || error.message, {depth: null}));
      throw error;
    }
  }

  /**
   * Создать новый воркфлоу
   */
  async createWorkflow(data: Types.NovuWorkflowData): Promise<any> {
    try {
      // Для создания НЕ передаем origin (как в testFramework2.ts)
      const createData = { ...data };
      
      delete createData.origin;
      
      const response = await this.client.post('/v2/workflows', createData);
      return response.data;
    } catch (error: any) {
      console.error(`Ошибка создания воркфлоу ${data.workflowId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Обновить существующий воркфлоу
   */
  async updateWorkflow(workflowId: string, data: Types.NovuWorkflowData): Promise<any> {
    try {
      // Для обновления ВСЕГДА передаем origin: "external" (как в testFramework2.ts)
      const updateData = { ...data, origin: 'novu-cloud' as const };
      const response = await this.client.put(`/v2/workflows/${workflowId}`, updateData);
      // console.log('response', response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Ошибка обновления воркфлоу ${workflowId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Удалить воркфлоу по ID
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await this.client.delete(`/v2/workflows/${workflowId}`);
      console.log(`Удален воркфлоу: ${workflowId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log(`Воркфлоу ${workflowId} не найден (уже удален)`);
        return;
      }
      console.error(`Ошибка удаления воркфлоу ${workflowId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Создать или обновить воркфлоу (upsert)
   */
  async upsertWorkflow(workflow: Types.WorkflowDefinition): Promise<any> {
    try {
      console.log(`Проверяем воркфлоу: ${workflow.workflowId}`);
      
      const existingWorkflow = await this.getWorkflow(workflow.workflowId);
      
      const novuData: Types.NovuWorkflowData = {
        name: workflow.name,
        workflowId: workflow.workflowId,
        description: workflow.description,
        payloadSchema: workflow.payloadSchema,
        steps: workflow.steps,
        preferences: workflow.preferences,
        tags: workflow.tags,
      };

      if (existingWorkflow) {
        console.log(`Обновляем воркфлоу: ${workflow.workflowId}`);
        return await this.updateWorkflow(workflow.workflowId, novuData);
      } else {
        console.log(`Создаём воркфлоу: ${workflow.workflowId}`);
        return await this.createWorkflow(novuData);
      }
    } catch (error: any) {
      console.error(`Ошибка upsert воркфлоу ${workflow.workflowId}:`, error.message);
      throw error;
    }
  }

  /**
   * Удалить все существующие воркфлоу
   */
  async deleteAllWorkflows(): Promise<void> {
    console.log('Получаем список всех воркфлоу для удаления...');

    try {
      const workflows = await this.getAllWorkflows();
      console.log(`Найдено ${workflows.length} воркфлоу для удаления`);

      if (workflows.length === 0) {
        console.log('Нет воркфлоу для удаления');
        return;
      }

      const errors: string[] = [];
      let deletedCount = 0;

      for (const workflow of workflows) {
        try {
          await this.deleteWorkflow(workflow.workflowId || workflow._id);
          deletedCount++;
        } catch (error: any) {
          const errorMessage = `Ошибка удаления воркфлоу ${workflow.workflowId || workflow._id}: ${error.message}`;
          console.error(`✗ ${errorMessage}`);
          errors.push(errorMessage);
        }
      }

      console.log(`\nРезультат удаления:`);
      console.log(`✅ Удалено: ${deletedCount}`);
      console.log(`❌ Ошибки: ${errors.length}`);

      if (errors.length > 0) {
        console.log(`\nСписок ошибок удаления:`);
        errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
        });
        throw new Error(`Удаление завершилось с ошибками: ${errors.length} из ${workflows.length} воркфлоу`);
      }

      console.log('✅ Все существующие воркфлоу удалены успешно');
    } catch (error: any) {
      console.error('❌ Критическая ошибка при удалении воркфлоу:', error.message);
      throw error;
    }
  }

  /**
   * Создать или обновить все воркфлоу (с предварительным удалением существующих)
   */
  async upsertAllWorkflows(): Promise<void> {
    console.log('🚀 Начинаем полную синхронизацию воркфлоу...');

    // Шаг 1: Удаляем все существующие воркфлоу
    // try {
    //   await this.deleteAllWorkflows();
    // } catch (error: any) {
    //   console.error('❌ Ошибка при удалении существующих воркфлоу:', error.message);
    //   throw error;
    // }

    // Шаг 2: Создаем новые воркфлоу
    console.log(`\n📝 Начинаем создание ${Workflows.allWorkflows.length} новых воркфлоу...`);

    const errors: string[] = [];
    let successCount = 0;

    for (const workflow of Workflows.allWorkflows) {
      try {
        await this.upsertWorkflow(workflow);
        console.log(`✓ Воркфлоу ${workflow.workflowId} успешно создан`);
        successCount++;
      } catch (error: any) {
        const errorMessage = `Ошибка создания воркфлоу ${workflow.workflowId}: ${error.message}`;
        console.error(`✗ ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    console.log(`\nРезультат синхронизации:`);
    console.log(`✅ Успешно создано: ${successCount}`);
    console.log(`❌ Ошибки: ${errors.length}`);

    if (errors.length > 0) {
      console.log(`\nСписок ошибок:`);
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });

      throw new Error(`Синхронизация завершилась с ошибками: ${errors.length} из ${Workflows.allWorkflows.length} воркфлоу`);
    }

    console.log('✅ Все воркфлоу синхронизированы успешно');
  }
} 