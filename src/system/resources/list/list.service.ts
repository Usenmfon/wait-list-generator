import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { List, ListDocument } from './schema/list.schema';
import { Model } from 'mongoose';
import { ServiceException } from 'src/helper/exceptions/exceptions/service.layer.exception';
import { parseDBError } from 'src/helper/main';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private ListSchema: Model<ListDocument>,
  ) {}

  async getAllLists() {
    try {
      return this.ListSchema.find().sort({ createdAt: -1 }).lean();
    } catch (e) {
      throw new ServiceException({ error: parseDBError(e) });
    }
  }

  async createList(user, dto) {
    return this.ListSchema.findOne({ title: dto.title })
      .then(async (resource) => {
        if (resource?.user === user.id) {
          throw new ServiceException({
            error: 'title already exists for user',
          });
        }

        dto.user = user.id;
        const list = new this.ListSchema({ ...dto });
        await list.save();
        return list;
      })
      .catch((e) => {
        throw new ServiceException({ error: parseDBError(e) });
      });
  }
}
