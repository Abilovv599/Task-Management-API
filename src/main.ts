import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { createSwagger } from '~/common/configs/swagger.config';

import { AppModule } from './modules/app.module';

export class App {
  private app: NestExpressApplication;
  private readonly environment: string;
  private readonly logger: Logger;

  constructor() {
    this.environment = process.env.NODE_ENV ?? 'development';
    this.logger = new Logger('Bootstrap', { timestamp: true });
  }

  async bootstrap() {
    this.app = await NestFactory.create<NestExpressApplication>(AppModule);

    this.setupVersioning();
    this.setupGlobalPrefix();
    this.setupCors();
    this.setupSwagger();

    const port = process.env.PORT ?? 3000;

    await this.app.listen(port);
    this.logger.log(`Application running in "${this.environment}" mode on http://localhost:${port}/api/docs`);
  }

  private setupVersioning() {
    this.app.enableVersioning({
      type: VersioningType.URI,
      prefix: 'v',
      defaultVersion: '1',
    });
  }

  private setupGlobalPrefix() {
    this.app.setGlobalPrefix('api');
  }

  private setupCors() {
    this.app.enableCors({
      origin: 'http://localhost:3001',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }

  private setupSwagger() {
    if (this.environment === 'development') {
      createSwagger(this.app);
    }
  }
}

const app = new App();

app.bootstrap().catch((error) => {
  console.error(error);
});
