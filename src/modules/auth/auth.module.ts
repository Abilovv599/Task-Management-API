import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '~/modules/users/users.module';

import { JwtAuthGuard } from '~/guards/jwt-auth.guard';

import { TwoFactorAuthController } from './controllers/2FA.controller';
import { AuthController } from './controllers/auth.controller';
import { GoogleAuthController } from './controllers/google-auth.controller';
import { TwoFactorAuthService } from './services/2FA.service';
import { AuthService } from './services/auth.service';
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleStrategy } from './strategies/google-auth.strategy';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('TOKEN_EXPIRE_TIME'),
        },
      }),
    }),
  ],
  controllers: [AuthController, TwoFactorAuthController, GoogleAuthController],
  providers: [
    AuthService,
    TwoFactorAuthService,
    GoogleAuthService,
    JwtAuthStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
