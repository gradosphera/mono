import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BullService } from './bull.service';
import { JobEntity } from './entities/job.entity';

@ApiTags('jobs') // Добавляет тег для группировки в Swagger UI
@Controller('jobs') // Базовый маршрут для всех методов этого контроллера
@Controller()
export class BullController {
  constructor(private readonly bullService: BullService) {}

  @ApiOperation({ summary: 'Получить все задачи' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает массив задач',
    type: [JobEntity],
  }) // Указываем, что возвращается массив
  @Get('/all')
  async getAllJobs(): Promise<JobEntity[]> {
    return this.bullService.getAllJobs();
  }
}
