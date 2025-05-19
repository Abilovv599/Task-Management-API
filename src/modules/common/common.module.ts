import { CacheModule } from '@nestjs/cache-manager';
import { Global, MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { configValidationSchema } from '~/common/schemas/config.schema';

import { GlobalExceptionFilter } from './filters/global-exceptions.filter';
import { RolesGuard } from './guards/roles.guard';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { PaginationService } from './services/pagination.service';

@Global()
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
  ],
  providers: [
    PaginationService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({ whitelist: true }),
    },
  ],
  exports: [PaginationService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*path');
  }
}
