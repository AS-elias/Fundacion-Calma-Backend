import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { CloudStorageService } from '../../../../core/cloud-storage/cloud-storage.service';

type UploadedProfileFile = {
  originalname: string;
  buffer: Buffer;
};

@Injectable()
export class PerfilStorageService {
  constructor(private readonly cloudStorageService: CloudStorageService) {}

  async saveFile(file: UploadedProfileFile) {
    const extension = extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    const urlArchivo = await this.cloudStorageService.uploadFile(
      file.buffer,
      'perfiles',
      filename,
    );

    return {
      nombreArchivo: file.originalname,
      urlArchivo,
    };
  }
}
