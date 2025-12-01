import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads/videos');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (error) {
  console.error('Error creating uploads directory:', error);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow video files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed video MIME types
  const allowedMimeTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/webm',
  ];

  // Check MIME type or file extension if MIME type is not set
  const hasValidMimeType = file.mimetype && allowedMimeTypes.includes(file.mimetype);
  const extension = file.originalname.split('.').pop()?.toLowerCase();
  const hasValidExtension = extension && ['mp4', 'mov', 'avi', 'webm', 'm4v'].includes(extension);

  if (hasValidMimeType || hasValidExtension) {
    cb(null, true);
  } else {
    console.error('❌ Invalid file type:', file.mimetype, file.originalname);
    cb(new Error('Apenas arquivos de vídeo são permitidos (MP4, MOV, AVI, WEBM)'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

// Single file upload middleware
export const uploadVideo = upload.single('video');

// Get file URL helper
export const getVideoUrl = (filename: string, req?: Request): string => {
  // If request is available, build URL from it (handles LAN IPs used by mobile devices)
  if (req) {
    const proto = req.protocol || 'http';
    const host = req.get('host');
    if (host) {
      return `${proto}://${host}/uploads/videos/${filename}`;
    }
  }

  // Fallback to env-configured base URL or localhost
  const rawBase =
    process.env.FILE_BASE_URL ||
    process.env.APP_URL ||
    process.env.BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`;

  const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
  return `${base}/uploads/videos/${filename}`;
};

// Delete video file helper
export const deleteVideoFile = (filename: string): void => {
  const filePath = path.join(uploadsDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export default upload;

