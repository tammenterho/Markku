import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/users.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

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

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn().mockReturnValue({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    }),
    refresh: jest.fn().mockReturnValue({
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signin', () => {
    it('should return access token and set refresh cookie', () => {
      const mockRes = {
        cookie: jest.fn(),
      } as any;
      const mockReq = { user: mockUser } as any;

      const result = controller.signin(mockReq, mockRes);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockRefreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and update cookie', () => {
      const mockRes = {
        cookie: jest.fn(),
      } as any;
      const mockReq = {
        cookies: { refreshToken: mockRefreshToken },
      } as any;

      const result = controller.refresh(mockReq, mockRes);

      expect(authService.refresh).toHaveBeenCalledWith(mockRefreshToken);
      expect(result).toEqual({ accessToken: mockAccessToken });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockRefreshToken,
        expect.any(Object),
      );
    });

    it('should handle missing refresh token', () => {
      const mockRes = {
        cookie: jest.fn(),
      } as any;
      const mockReq = { cookies: {} } as any;

      mockAuthService.refresh.mockImplementation(() => {
        throw new Error('Refresh token missing');
      });

      expect(() => controller.refresh(mockReq, mockRes)).toThrow(
        'Refresh token missing',
      );
    });
  });

  describe('logout', () => {
    it('should clear refresh cookie', () => {
      const mockRes = {
        clearCookie: jest.fn(),
      } as any;

      const result = controller.logout(mockRes);

      expect(result).toEqual({ success: true });
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
        }),
      );
    });
  });

  describe('signup', () => {
    it('should register new user', async () => {
      const body = { username: 'newuser', password: 'password123' };

      await controller.signup(body);

      expect(authService.register).toHaveBeenCalledWith(
        'newuser',
        'password123',
      );
    });
  });
});
