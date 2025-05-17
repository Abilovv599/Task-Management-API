import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { createSwagger } from '~/configs/swagger.config';
import { AllExceptionsFilter } from '~/filter/all-exceptions.filter';
import { TransformInterceptor } from '~/interceptors/transform.interceptor';

import { AppModule } from './modules/app.module';

async function bootstrap() {
  const environment = process.env.NODE_ENV ?? 'development';

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  logger.log(`Application running in "${environment}" mode on http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error(error);
});
