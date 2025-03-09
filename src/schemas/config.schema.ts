import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import Joi from 'joi';
import type { StringValue } from 'ms';

export interface IConfigSchema {
  NODE_ENV: 'development' | 'production' | 'test';

  DB_TYPE: TypeOrmModuleOptions['type'];
  DB_NAME: TypeOrmModuleOptions['database'];
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;

  JWT_SECRET: string;
  TOKEN_EXPIRE_TIME: StringValue;

  GOOGLE_AUTH_CLIENT_ID: string;
  GOOGLE_AUTH_CLIENT_SECRET: string;
  GOOGLE_AUTH_CALLBACK_URL: string;
}

export const configValidationSchema = Joi.object<IConfigSchema>({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  DB_TYPE: Joi.string().default('postgres'),
  DB_NAME: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  TOKEN_EXPIRE_TIME: Joi.string().default('1day'),

  GOOGLE_AUTH_CLIENT_ID: Joi.string().required(),
  GOOGLE_AUTH_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_AUTH_CALLBACK_URL: Joi.string().required(),
});
