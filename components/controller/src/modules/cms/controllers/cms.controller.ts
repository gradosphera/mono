// src/cms/cms.controller.ts
import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('cms')
export class CmsController {
  @Get('*') // Обрабатываем все запросы
  serveCms(@Param() params: any, @Res() res: Response) {
    const filePath = join(
      __dirname,
      '../../public/cms',
      params[0] || 'index.html',
    );
    res.sendFile(filePath); // Возвращаем запрашиваемый файл
  }
}

// <iframe src="https://yourdomain.com/cms?token=YOUR_JWT_TOKEN&product_id=123"></iframe>
