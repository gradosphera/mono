import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Создание файла swagger.json
  const swaggerFilePath = join(process.cwd(), 'swagger.json');
  writeFileSync(swaggerFilePath, JSON.stringify(document, null, 2), {
    encoding: 'utf8',
  });
  Logger.log(`Swagger JSON file generated at: ${swaggerFilePath}`, 'Swagger');

  // Настройка Swagger UI
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 4090);
  Logger.log(
    `Application started on ${process.env.PORT ?? 4090} port`,
    'System',
  );
}
bootstrap();
