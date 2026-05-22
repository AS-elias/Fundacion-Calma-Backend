import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudStorageService {
  private readonly logger = new Logger(CloudStorageService.name);

  constructor() {
    // Cloudinary will automatically pick up the CLOUDINARY_URL environment variable if set.
    // Ensure you have CLOUDINARY_URL in your .env file, e.g.:
    // CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  }

  async uploadFile(fileBuffer: Buffer, folder: string, filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
          resource_type: 'auto',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Error uploading file to Cloudinary', error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error('No result returned from Cloudinary'));
          }
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }
}
