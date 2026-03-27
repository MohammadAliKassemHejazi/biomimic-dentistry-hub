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

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  },
});

export const processImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  // If the file is not an image, just save it to disk directly
  if (!req.file.mimetype.startsWith('image/')) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(req.file.originalname);
      const filename = req.file.fieldname + '-' + uniqueSuffix + ext;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, req.file.buffer);

      req.file.filename = filename;
      req.file.path = filepath;
      return next();
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  // We'll convert images to webp to save space
  const filename = req.file.fieldname + '-' + uniqueSuffix + '.webp';
  const filepath = path.join(uploadDir, filename);

  try {
    await sharp(req.file.buffer)
      .resize(1200, 1200, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(filepath);

    req.file.filename = filename;
    req.file.path = filepath;
    req.file.mimetype = 'image/webp';
    // Optionally update req.file.size
    const stat = fs.statSync(filepath);
    req.file.size = stat.size;

    next();
  } catch (error) {
    console.error('Error processing image:', error);
    next(error);
  }
};
