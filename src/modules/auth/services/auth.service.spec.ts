import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthCredentialsDto } from '~/modules/auth/dtos/auth-credentials.dto';
import { User } from '~/modules/users/entity/user.entity';
import { Role } from '~/modules/users/enums/role.enum';
import { UsersService } from '~/modules/users/services/users.service';

import * as bcryptLib from '~/common/lib/bcrypt';

import { AuthService } from './auth.service';

// Mock the comparePassword function
jest.mock('~/common/lib/bcrypt', () => ({
  comparePassword: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<jest.Mocked<UsersService>>(UsersService);
    jwtService = module.get<jest.Mocked<JwtService>>(JwtService);
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      // Arrange
      const authCredentialsDto: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersService.getUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.validateUser(authCredentialsDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(authCredentialsDto.email);
    });

    it('should throw UnauthorizedException if passwords do not match', async () => {
      // Arrange
      const authCredentialsDto: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: 'test-user-id',
        email: authCredentialsDto.email,
        password: 'hashed_password',
        isTwoFactorEnabled: false,
        isOAuthUser: false,
        role: Role.User,
        tasks: [],
      };

      usersService.getUserByEmail.mockResolvedValue(mockUser);
      (bcryptLib.comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.validateUser(authCredentialsDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(authCredentialsDto.email);
      expect(bcryptLib.comparePassword).toHaveBeenCalledWith(authCredentialsDto.password, mockUser.password);
    });

    it('should return user if credentials are valid', async () => {
      // Arrange
      const authCredentialsDto: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: 'test-user-id',
        email: authCredentialsDto.email,
        password: 'hashed_password',
        isTwoFactorEnabled: false,
        isOAuthUser: false,
        role: Role.User,
        tasks: [],
      };

      usersService.getUserByEmail.mockResolvedValue(mockUser);
      (bcryptLib.comparePassword as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.validateUser(authCredentialsDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.getUserByEmail).toHaveBeenCalledWith(authCredentialsDto.email);
      expect(bcryptLib.comparePassword).toHaveBeenCalledWith(authCredentialsDto.password, mockUser.password);
    });
  });

  describe('generateJwtToken', () => {
    it('should generate a JWT token', async () => {
      // Arrange
      const mockUser: User = {
        id: 'test-user-id',
        email: 'test@example.com',
        isTwoFactorEnabled: false,
        isOAuthUser: false,
        role: Role.User,
        tasks: [],
      };

      const mockToken = 'mock-jwt-token';
      jwtService.signAsync.mockResolvedValue(mockToken);

      // Act
      const result = await authService.generateJwtToken(mockUser);

      // Assert
      expect(result).toEqual({ accessToken: mockToken });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
    });
  });

  describe('signIn', () => {
    it('should return 2FA requirement if user has 2FA enabled', async () => {
      // Arrange
      const authCredentialsDto: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: 'test-user-id',
        email: authCredentialsDto.email,
        password: 'hashed_password',
        isTwoFactorEnabled: true,
        isOAuthUser: false,
        role: Role.User,
        tasks: [],
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);

      // Act
      const result = await authService.signIn(authCredentialsDto);

      // Assert
      expect(result).toEqual({
        requires2FA: true,
        email: mockUser.email,
      });
      expect(authService.validateUser).toHaveBeenCalledWith(authCredentialsDto);
    });

    it('should return JWT token if user does not have 2FA enabled', async () => {
      // Arrange
      const authCredentialsDto: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: 'test-user-id',
        email: authCredentialsDto.email,
        password: 'hashed_password',
        isTwoFactorEnabled: false,
        isOAuthUser: false,
        role: Role.User,
        tasks: [],
      };

      const mockToken = 'mock-jwt-token';

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'generateJwtToken').mockResolvedValue({ accessToken: mockToken });

      // Act
      const result = await authService.signIn(authCredentialsDto);

      // Assert
      expect(result).toEqual({ accessToken: mockToken });
      expect(authService.validateUser).toHaveBeenCalledWith(authCredentialsDto);
      expect(authService.generateJwtToken).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('signUp', () => {
    it('should call usersService.createUser and return the result', async () => {
      // Arrange
      const authCredentialsDto: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser: User = {
        id: 'test-user-id',
        email: authCredentialsDto.email,
        password: 'hashed_password',
        isTwoFactorEnabled: false,
        isOAuthUser: false,
        role: Role.User,
        tasks: [],
      };

      usersService.createUser.mockResolvedValue(mockUser);

      // Act
      const result = await authService.signUp(authCredentialsDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(usersService.createUser).toHaveBeenCalledWith(authCredentialsDto);
    });
  });
});
