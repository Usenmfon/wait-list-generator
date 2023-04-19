import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Contact, ContactDocument } from './schema/contact.schema';
import { Model } from 'mongoose';
import { ServiceException } from 'src/helper/exceptions/exceptions/service.layer.exception';
import { parseDBError } from 'src/helper/main';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private ContactSchema: Model<ContactDocument>,
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
  async createContact(dto, params) {
    return this.ContactSchema.findOne({ phoneNumber: dto.phoneNumber })
      .then(async (phone) => {
        if (phone) {
          throw new ServiceException({ error: 'phone number already exists' });
        }

        dto.user = params.user_id;
        dto.list = params.list_id;

        const contact = new this.ContactSchema({ ...dto });
        await contact.save();
        return contact;
      })
      .catch((e) => {
        throw new ServiceException({ error: parseDBError(e) });
      });
  }
}
