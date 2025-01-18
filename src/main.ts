import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from '~/interceptors/tranfsorm.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: 'http://localhost:3001', // Replace with the origin you want to allow
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies if needed
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error(error);
});
