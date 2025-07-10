import axios, { AxiosInstance } from 'axios';
import { 
  WorkflowDefinition, 
  NovuWorkflowData,
  allWorkflows 
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
   * Создать новый воркфлоу
   */
  async createWorkflow(data: NovuWorkflowData): Promise<any> {
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
  async updateWorkflow(workflowId: string, data: NovuWorkflowData): Promise<any> {
    try {
      // Для обновления ВСЕГДА передаем origin: "external" (как в testFramework2.ts)
      const updateData = { ...data, origin: 'external' as const };
      
      const response = await this.client.put(`/v2/workflows/${workflowId}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error(`Ошибка обновления воркфлоу ${workflowId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Создать или обновить воркфлоу (upsert)
   */
  async upsertWorkflow(workflow: WorkflowDefinition): Promise<any> {
    try {
      console.log(`Проверяем воркфлоу: ${workflow.workflowId}`);
      
      const existingWorkflow = await this.getWorkflow(workflow.workflowId);
      const novuData: NovuWorkflowData = {
        name: workflow.name,
        workflowId: workflow.workflowId,
        description: workflow.description,
        payloadSchema: workflow.payloadSchema,
        steps: workflow.steps,
        preferences: workflow.preferences,
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
   * Создать или обновить все воркфлоу
   */
  async upsertAllWorkflows(): Promise<void> {
    console.log(`Начинаем upsert ${allWorkflows.length} воркфлоу...`);
    
    const errors: string[] = [];
    let successCount = 0;
    
    for (const workflow of allWorkflows) {
      try {
        await this.upsertWorkflow(workflow);
        console.log(`✓ Воркфлоу ${workflow.workflowId} успешно обработан`);
        successCount++;
      } catch (error: any) {
        const errorMessage = `Ошибка обработки воркфлоу ${workflow.workflowId}: ${error.message}`;
        console.error(`✗ ${errorMessage}`);
        errors.push(errorMessage);
      }
    }
    
    console.log(`\nРезультат синхронизации:`);
    console.log(`✅ Успешно: ${successCount}`);
    console.log(`❌ Ошибки: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log(`\nСписок ошибок:`);
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      
      throw new Error(`Синхронизация завершилась с ошибками: ${errors.length} из ${allWorkflows.length} воркфлоу`);
    }
    
    console.log('✅ Все воркфлоу синхронизированы успешно');
  }
} 