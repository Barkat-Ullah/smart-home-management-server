import httpStatus from 'http-status';
import ApiError from '../errors/AppError';
import { fileUploader } from './fileUploader';

export type UploadedFiles = {
  [x: string]: any;
  image?: string;
  video?: string;
  pdf?: string;
  files?: string;
};

export const handleFileUploads = async (
  files: { [fieldname: string]: Express.Multer.File[] } | undefined,
): Promise<UploadedFiles> => {
  if (!files) return {};

  const uploadTasks: Promise<void>[] = [];
  const uploadedFiles: UploadedFiles = {};

  if (files?.image?.[0]) {
    uploadTasks.push(
      fileUploader.uploadToCloudinaryWithType(files.image[0], 'image')
        .then(upload => { uploadedFiles.image = upload.Location; })
    );
  }

  if (files?.video?.[0]) {
    uploadTasks.push(
      fileUploader.uploadToCloudinaryWithType(files.video[0], 'video')
        .then(upload => { uploadedFiles.video = upload.Location; })
    );
  }

  if (files?.pdf?.[0]) {
    uploadTasks.push(
      fileUploader.uploadToCloudinaryWithType(files.pdf[0], 'pdf')
        .then(upload => { uploadedFiles.pdf = upload.Location; })
    );
  }

  if (files?.files?.[0]) {
    const file = files.files[0];
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    let fileType: 'image' | 'video' | 'pdf' = 'pdf';
    if (['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(ext || '')) fileType = 'image';
    else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) fileType = 'video';

    uploadTasks.push(
      fileUploader.uploadToCloudinaryWithType(file, fileType)
        .then(upload => { uploadedFiles.files = upload.Location; })
    );
  }

  try {
    await Promise.all(uploadTasks);
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to upload file', error);
  }

  return uploadedFiles;
};
