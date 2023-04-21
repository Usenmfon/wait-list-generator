import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/auth.schema';
import { Model } from 'mongoose';
import * as argon from 'argon2';
import { IAuthUser } from './interfaces/auth.interface';
import { SignInDto, SignUpDto } from './dto';
import { ServiceException } from 'src/helper/exceptions/exceptions/service.layer.exception';
import { parseDBError } from 'src/helper/main';
import { bruteForceCheck } from './helper/auth.helper';
import { NewUserEvent } from './entities/event.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MailService } from 'src/helper/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserSchema: Model<UserDocument>,
    private jwt: JwtService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
    private mailService: MailService,
  ) {}

  async signup(dto: SignUpDto): Promise<IAuthUser> {
    return this.UserSchema.find({ email: dto.email })
      .then(async (users) => {
        if (users.length) {
          throw new ServiceException({ error: 'email already exist' });
        }

        const user = new this.UserSchema({ ...dto });
        const password = await argon.hash(user.password);
        user.password = password;
        const eventObject = new NewUserEvent();
        eventObject.user = user;
        await user.save();
        this.eventEmitter.emit('user.new', eventObject);
        await this.mailService
          .sendUserConfirmation(user, 'token not set')
          .catch((e) => {
            throw new ServiceException({ error: parseDBError(e) });
          });
        return this.signToken(user);
      })
      .catch((e) => {
        throw new ServiceException({ error: parseDBError(e) });
      });
  }

  async googleAuth(dto) {
    return this.UserSchema.find({ email: dto.email })
      .then(async (users) => {
        if (users.length) {
          throw new ServiceException({ error: 'email already exist' });
        }

        const user = new this.UserSchema({ ...dto });
        await user.save();
        return user;
      })
      .catch((e) => {
        throw new ServiceException({ error: parseDBError(e) });
      });
  }

  async signin(dto: SignInDto): Promise<IAuthUser> {
    return this.UserSchema.findOne({ email: dto.email })
      .then(async (user) => {
        if (!user) {
          throw new ServiceException({ error: 'User not found' });
        }

        if (!(await bruteForceCheck(user))) {
          throw new ServiceException({ error: 'Too many attempts' });
        }

        if (await argon.verify(user.password, dto.password)) {
          user.attempt = 0;
          await user.save();
          return this.signToken(user);
        }
        throw new ServiceException({ error: 'Credentials incorrect' });
      })
      .catch((e) => {
        throw new ServiceException({ error: parseDBError(e) });
      });
  }

  async signToken(user: UserDocument): Promise<IAuthUser> {
    const payload = {
      id: user._id,
      email: user.email,
      type: user.type,
    };

    const secret = this.config.get('JWT_SECRET');

    const token: string = await this.jwt.signAsync(payload, {
      expiresIn: '48hr',
      secret: secret,
    });

    const refreshToken: string = await this.jwt.signAsync(payload, {
      expiresIn: '48hr',
      secret: secret,
    });

    const authUser: IAuthUser = {
      token,
      ...payload,
    };

    user.refreshToken = refreshToken;
    user.isActive = true;

    await user.save();

    return authUser;
  }
}
