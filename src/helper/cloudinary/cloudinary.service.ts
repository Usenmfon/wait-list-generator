import { Injectable } from '@nestjs/common';
import {
  DeleteApiResponse,
  UploadApiErrorResponse,
  UploadApiResponse,
  v2,
} from 'cloudinary';
import toStream = require('buffer-to-stream');
import { ServiceException } from '../exceptions/exceptions/service.layer.exception';
import { parseDBError } from '../main';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
      toStream(file.buffer).pipe(upload);
    });
  }

  async deleteImage(publicId: string): Promise<DeleteApiResponse> {
    return await v2.uploader.destroy(publicId).catch((e) => {
      throw new ServiceException({ error: parseDBError(e) });
    });
  }
}
