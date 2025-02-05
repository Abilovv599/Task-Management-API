import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';
import { TransformInterceptor } from '~/interceptors/tranfsorm.interceptor';
import { createSwagger } from '~/modules/swagger/swagger.builder';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const logger = new Logger('Bootstrap', { timestamp: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies if needed
  });

  createSwagger(app);

  const port = process.env.PORT;

  await app.listen(port ?? 3000);

  const environment = process.env.NODE_ENV || 'development';

  logger.log(
    `Application running in ${environment} mode on http://localhost:${port}`,
  );
}

bootstrap().catch((error) => {
  console.error(error);
});
