import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { IAuthUser } from 'src/auth/interfaces';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: IAuthUser, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to Wait List Generator! Confirm your Email',
      template: './confirmation',
      context: {
        name: user.fullname,
        url,
      },
    });
  }

  async sendNotification(user: IAuthUser, contact) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'New Sign Up Alert!',
      template: './notification',
      context: {
        name: user.fullname,
        contact,
      },
    });
  }
}
