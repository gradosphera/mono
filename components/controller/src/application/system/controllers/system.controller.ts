import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

/**
 * REST контроллер для системных операций
 */
@Controller('v1/system')
export class SystemController {
  /**
   * Проверка здоровья сервиса
   * @returns Promise<string>
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  async getHealth(): Promise<string> {
    return 'OK';
  }
}