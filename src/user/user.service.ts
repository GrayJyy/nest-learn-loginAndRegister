import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const md5 = (str: string) => {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};

@Injectable()
export class UserService {
  private readonly logger = new Logger();
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  async register(user: RegisterDto) {
    const _register = await this.userRepository.findOneBy({
      username: user.username,
    });
    if (_register)
      throw new HttpException('注册账户已存在', HttpStatus.NOT_ACCEPTABLE);
    const _newUser = new User();
    [_newUser.username, _newUser.password] = [
      user.username,
      md5(user.password),
    ];

    try {
      await this.userRepository.save(_newUser);
      return new HttpException('注册成功', HttpStatus.CREATED);
    } catch (error) {
      this.logger.error(error, UserService);
      throw new HttpException('注册失败', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  async login(user: LoginDto) {
    const _foundUser = await this.userRepository.findOneBy({
      username: user.username,
    });
    if (!_foundUser)
      throw new HttpException('该用户未注册', HttpStatus.NOT_ACCEPTABLE);
    if (_foundUser.password !== md5(user.password))
      throw new HttpException('密码错误', HttpStatus.NOT_ACCEPTABLE);

    return _foundUser;
  }
}
