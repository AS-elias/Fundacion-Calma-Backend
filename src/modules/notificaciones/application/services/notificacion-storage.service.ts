import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { CloudStorageService } from '../../../../core/cloud-storage/cloud-storage.service';

type UploadedNotificacionFile = {
  originalname: string;
  buffer: Buffer;
};

@Injectable()
export class NotificacionStorageService {
  constructor(private readonly cloudStorageService: CloudStorageService) {}

  async saveFile(file: UploadedNotificacionFile) {
    const extension = extname(file.originalname);

    const filename =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    const urlArchivo = await this.cloudStorageService.uploadFile(
      file.buffer,
      'notificaciones',
      filename,
    );

    return {
      nombreArchivo: file.originalname,
      urlArchivo,
    };
  }
}
