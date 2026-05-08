import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

type UploadedConvenioFile = {
  originalname: string;
  buffer: Buffer;
};

@Injectable()
export class ConvenioArchivoStorageService {
  constructor(private readonly configService: ConfigService) {}

  async saveFile(file: UploadedConvenioFile): Promise<{
    nombreArchivo: string;
    urlArchivo: string;
  }> {
    const uploadsDir = join(process.cwd(), 'uploads', 'convenios');
    await mkdir(uploadsDir, { recursive: true });

    const extension = extname(file.originalname) || '.pdf';
    const safeBaseName = file.originalname
      .replace(extension, '')
      .trim()
      .replace(/[^a-zA-Z0-9-_]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    const fileName = `${safeBaseName || 'archivo'}-${randomUUID()}${extension}`;

    await writeFile(join(uploadsDir, fileName), file.buffer);

    return {
      nombreArchivo: file.originalname,
      urlArchivo: `${this.getBaseUrl()}/uploads/convenios/${fileName}`,
    };
  }

  private getBaseUrl(): string {
    const configuredBaseUrl = this.configService.get<string>('APP_URL');
    if (configuredBaseUrl) {
      return configuredBaseUrl.replace(/\/+$/, '');
    }

    const port = this.configService.get<string>('PORT') ?? '3005';
    return `http://localhost:${port}`;
  }
}
