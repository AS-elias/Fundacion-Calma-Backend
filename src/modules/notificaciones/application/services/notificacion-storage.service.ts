import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { extname, join } from 'path';

type UploadedNotificacionFile = {
  originalname: string;
  buffer: Buffer;
};

@Injectable()
export class NotificacionStorageService {
  async saveFile(file: UploadedNotificacionFile) {

    const extension = extname(file.originalname);

    const filename =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    const folderPath = join(
      process.cwd(),
      'uploads',
      'notificaciones'
    );

    const uploadPath = join(folderPath, filename);

    await fs.mkdir(folderPath, { recursive: true });

    await fs.writeFile(uploadPath, file.buffer);

    return {
      nombreArchivo: file.originalname,
      urlArchivo: `/uploads/notificaciones/${filename}`,
    };
  }
}
