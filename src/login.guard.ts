import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request & { user: string } = context
      .switchToHttp()
      .getRequest();

    // header的Authorization 约定俗成的格式为`bearer ${token}`
    const _bearer = (request.header('authorization') || '').split(' ');
    if (!_bearer || _bearer.length < 2)
      throw new UnauthorizedException('登录 token 错误');
    const _token = _bearer[1];
    try {
      const _info = this.jwtService.verify(_token);
      request.user = _info.user;
      return true;
    } catch (e) {
      console.error(e);
      throw new UnauthorizedException('登录 token 失效，请重新登录');
    }
  }
}
