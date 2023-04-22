import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Contact, ContactDocument } from './schema/contact.schema';
import { Model } from 'mongoose';
import { ServiceException } from 'src/helper/exceptions/exceptions/service.layer.exception';
import { parseDBError } from 'src/helper/main';
import { User, UserDocument } from 'src/auth/schema/auth.schema';
import { MailService } from 'src/helper/mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private ContactSchema: Model<ContactDocument>,
    @InjectModel(User.name) private UserSchema: Model<UserDocument>,
    private mailService: MailService,
  ) {}

  async getAllContacts() {
    try {
      return this.ContactSchema.find().sort({ createdAt: -1 }).lean();
    } catch (e) {
      throw new ServiceException({ error: parseDBError(e) });
    }
  }

  //TODO: Make it dynamic (Add event emitter)
  //TODO: Check if number exists in the same list
  //TODO: Correct finding existing numbers
  async createContact(dto, params) {
    return this.ContactSchema.findOne({ phoneNumber: dto.phoneNumber })
      .then(async (phone) => {
        if (phone) {
          throw new ServiceException({ error: 'phone number already exists' });
        }

        dto.user = params.user_id;
        dto.list = params.list_id;

        const user = await this.UserSchema.findOne({ _id: params.user_id });

        await this.mailService
          .sendNotification(user, dto.phoneNumber)
          .catch((e) => {
            throw new ServiceException({ error: parseDBError(e) });
          });

        const contact = new this.ContactSchema({ ...dto });
        await contact.save();
        return contact;
      })
      .catch((e) => {
        throw new ServiceException({ error: parseDBError(e) });
      });
  }
}
