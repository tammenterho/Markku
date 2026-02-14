import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/users.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let passwordService: PasswordService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 'user-123',
    username: 'testuser',
    passwordHash: 'hashed-password',
    companies: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';

  const mockUsersService = {
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  const mockPasswordService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const username = 'newuser';
      const password = 'password123';

      mockUsersService.findByUsername.mockResolvedValue(null);
      mockPasswordService.hash.mockResolvedValue('hashed-password');
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(username, password);

      expect(usersService.findByUsername).toHaveBeenCalledWith(username);
      expect(passwordService.hash).toHaveBeenCalledWith(password);
      expect(usersService.create).toHaveBeenCalledWith(
        username,
        'hashed-password',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user exists', async () => {
      const username = 'existinguser';

      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      await expect(service.register(username, 'password123')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', () => {
      mockJwtService.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, {
        sub: mockUser.id,
        username: mockUser.username,
      });
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, {
        sub: mockUser.id,
        username: mockUser.username,
      });
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });
  });

  describe('refresh', () => {
    it('should return new tokens when refresh token is valid', () => {
      const refreshPayload = {
        sub: mockUser.id,
        username: mockUser.username,
      };

      mockJwtService.verify.mockReturnValue(refreshPayload);
      mockJwtService.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = service.refresh(mockRefreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(
        mockRefreshToken,
        expect.objectContaining({ secret: expect.any(String) }),
      );
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    it('should throw UnauthorizedException when refresh token is missing', () => {
      expect(() => service.refresh(undefined)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token is invalid', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.refresh('invalid-token')).toThrow(
        UnauthorizedException,
      );
    });
  });
});
