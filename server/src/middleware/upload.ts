import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage(); // Store in memory first for sharp to process

// Generic upload (images + documents — used for blog, resources, partnership kit)
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  },
});

// Image-only upload — rejects non-image MIME types at the multer level.
// Use for fields that must contain a displayable image (partner logo, course
// featured image, leadership member photo, etc.) so the frontend can safely
// use <Image> / <img> without a MIME-type guard.
export const uploadImageOnly = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB for images
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error(
        'Only image files are allowed here. Please upload a JPG, PNG, WebP, GIF, or SVG file.'
      ));
      return;
    }
    cb(null, true);
  },
});

async function processSingleFile(file: Express.Multer.File): Promise<void> {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

  if (!file.mimetype.startsWith('image/')) {
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    file.filename = filename;
    file.path = filepath;
    return;
  }

  const filename = file.fieldname + '-' + uniqueSuffix + '.webp';
  const filepath = path.join(uploadDir, filename);

  await sharp(file.buffer)
    .resize(1200, 1200, { fit: sharp.fit.inside, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);

  file.filename = filename;
  file.path = filepath;
  file.mimetype = 'image/webp';
  const stat = fs.statSync(filepath);
  file.size = stat.size;
}

export const processImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();
  try {
    await processSingleFile(req.file);
    next();
  } catch (error) {
    console.error('Error processing image:', error);
    next(error);
  }
};

export const processImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const featuredFile = (req.files as any)?.featured_image?.[0];
    const contentFiles: Express.Multer.File[] = (req.files as any)?.images || [];

    if (featuredFile) await processSingleFile(featuredFile);
    await Promise.all(contentFiles.map(processSingleFile));

    next();
  } catch (error) {
    console.error('Error processing images:', error);
    next(error);
  }
};
