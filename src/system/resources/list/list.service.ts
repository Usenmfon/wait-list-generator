import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { List, ListDocument } from './schema/list.schema';
import { Model } from 'mongoose';
import { ServiceException } from 'src/helper/exceptions/exceptions/service.layer.exception';
import { parseDBError } from 'src/helper/main';
import { CloudinaryService } from 'src/helper/cloudinary/cloudinary.service';
import { CreateListDto } from './dto';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private ListSchema: Model<ListDocument>,
    private cloudinary: CloudinaryService,
  ) {}

  async getAllLists() {
    try {
      return this.ListSchema.find().sort({ createdAt: -1 }).lean();
    } catch (e) {
      throw new ServiceException({ error: parseDBError(e) });
    }
  }

  async getList(id) {
    try {
      const list = this.ListSchema.findOne({ _id: id });
      return list;
    } catch (e) {
      throw new ServiceException({ error: parseDBError(e) });
    }
  }

  async createList(user, dto: CreateListDto, file?: Express.Multer.File) {
    return this.ListSchema.findOne({ title: dto.title })
      .then(async (resource) => {
        if (resource?.user === user.id) {
          throw new ServiceException({
            error: 'title already exists for user',
          });
        }

        if (file) {
          const avatar = await this.cloudinary.uploadImage(file).catch(() => {
            throw new BadRequestException('Invalid file type');
          });
          if (avatar) {
            dto.avatar = avatar.url;
            dto.avatar_id = avatar.public_id;
          }
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

  async updateList(id, dto, file?: Express.Multer.File) {
    try {
      const avatarExists = await this.ListSchema.findOne({ _id: id });
      if (avatarExists.avatar_id) {
        await this.cloudinary.deleteImage(avatarExists.avatar_id);
      }

      if (file) {
        const avatar = await this.cloudinary.uploadImage(file).catch(() => {
          throw new BadRequestException('Invalid file type');
        });
        if (avatar) {
          dto.avatar = avatar.url;
          dto.avatar_id = avatar.public_id;
        }
      }

      return this.ListSchema.findOneAndUpdate({ _id: id }, dto, {
        new: true,
        upsert: true,
      }).then(async (list) => {
        return list;
      });
    } catch (e) {
      throw new ServiceException({ error: parseDBError(e) });
    }
  }

  async deleteList(user, params) {
    try {
      const list = await this.ListSchema.findOne({ _id: params.id }).populate([
        { path: 'user', select: ['_id'] },
      ]);
      if (!list) {
        throw new ServiceException({ error: 'List not found', status: 404 });
      }

      if (list.avatar_id) {
        await this.cloudinary.deleteImage(list.avatar_id);
      }

      // if (user.id == list.user) {
      if (user.id) {
        await list.deleteOne();
        return true;
      }
      throw new ServiceException({ error: 'permission denied', status: 403 });
    } catch (e) {
      throw new ServiceException({ error: parseDBError(e) });
    }
  }
}
