import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { CloudStorageService } from '../../../../../core/cloud-storage/cloud-storage.service';

type UploadedConvenioFile = {
  originalname: string;
  buffer: Buffer;
};

@Injectable()
export class ConvenioArchivoStorageService {
  constructor(private readonly cloudStorageService: CloudStorageService) {}

  async saveFile(file: UploadedConvenioFile): Promise<{
    nombreArchivo: string;
    urlArchivo: string;
  }> {
    const extension = extname(file.originalname) || '.pdf';
    const safeBaseName = file.originalname
      .replace(extension, '')
      .trim()
      .replace(/[^a-zA-Z0-9-_]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    const fileName = `${safeBaseName || 'archivo'}-${randomUUID()}${extension}`;

    const urlArchivo = await this.cloudStorageService.uploadFile(
      file.buffer,
      'convenios',
      fileName,
    );

    return {
      nombreArchivo: file.originalname,
      urlArchivo,
    };
  }
}
