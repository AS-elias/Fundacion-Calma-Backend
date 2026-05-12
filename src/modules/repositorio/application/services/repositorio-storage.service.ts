import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';

type UploadedRepositorioFile = {
  originalname: string;
  buffer: Buffer;
};

@Injectable()
export class RepositorioStorageService {
  async saveFile(file: UploadedRepositorioFile) {
    const uploadsDir = join(process.cwd(), 'uploads', 'repositorio');
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
      nombreDocumento: file.originalname,
      urlDocumento: `/uploads/repositorio/${fileName}`,
    };
  }
}
