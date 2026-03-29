import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { Response } from 'express';
import { User } from 'src/users/users.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: { username: string; password: string }) {
    await this.authService.register(body.username, body.password);
    return { success: true };
  }

  @Post('signin')
  @UseGuards(AuthGuard('local'))
  signin(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = this.authService.login(
      req.user as User,
    );
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Patch('password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Req() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const user = req.user as User;
    return this.authService.changePassword(
      user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = this.authService.refresh(
      req.cookies?.refreshToken,
    );
    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    this.clearRefreshCookie(res);
    return { success: true };
  }

  private setRefreshCookie(res: Response, token: string) {
    const maxAge = 3 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh',
      maxAge,
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh',
    });
  }
}
