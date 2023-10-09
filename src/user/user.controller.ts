import {
  Controller,
  Post,
  Body,
  Inject,
  Res,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Post('login')
  async login(
    @Body(ValidationPipe) user: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const _user = await this.userService.login(user);
    if (_user) {
      const _token = await this.jwtService.signAsync({
        user: {
          username: _user.username,
          password: _user.password,
        },
      });
      response.setHeader('token', _token);
      throw new HttpException('登录成功', HttpStatus.OK);
    } else {
      throw new HttpException('登录失败', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  @Post('register')
  register(@Body(ValidationPipe) user: RegisterDto) {
    return this.userService.register(user);
  }
}
