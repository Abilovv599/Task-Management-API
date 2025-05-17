import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { createSwagger } from '~/configs/swagger.config';
import { AllExceptionsFilter } from '~/filters/all-exceptions.filter';
import { TransformInterceptor } from '~/interceptors/transform.interceptor';

import { AppModule } from './modules/app.module';

async function bootstrap() {
  const environment = process.env.NODE_ENV ?? 'development';

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies if needed
  });

  if (environment === 'development') {
    createSwagger(app);
  }

  const port = process.env.PORT;

  await app.listen(port ?? 3000);

  const logger = new Logger('Bootstrap', { timestamp: true });

  logger.log(`Application running in "${environment}" mode on http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error(error);
});
