import 'newrelic';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Vyma API')
    .setDescription('Vyma Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    customCssUrl:
      'https://cdn.jsdelivr.net/npm/swagger-themes@1.4.3/themes/dark.min.css',
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT);
  logger.log(`App running on port ${process.env.PORT}`);
  logger.log(
    `Swagger documentation available at http://localhost:${process.env.PORT}/api/v1/docs`,
  );

  // Indica a PM2 que el proceso ya está escuchando peticiones (wait_ready: true)
  if (process.send) {
    process.send('ready');
  }
}

bootstrap();
