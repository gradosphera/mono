// infrastructure/generator/generator.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeneratorService {
  async generateDocument(template: string, data: any): Promise<Buffer> {
    console.log(`Генерация документа с использованием шаблона ${template}`);
    // Логика генерации
    return Buffer.from('Generated Document');
  }

  async storeDocument(document: Buffer): Promise<string> {
    console.log(`Сохранение документа`);
    // Логика сохранения
    return 'document-id';
  }
}
