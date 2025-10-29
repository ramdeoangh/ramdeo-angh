import multer from 'multer';
import path from 'path';
import { loadEnv } from '../config/env';

const env = loadEnv();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.resolve(process.cwd(), env.FILE_UPLOAD_DIR)),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
    const ts = Date.now();
    cb(null, `${ts}_${safeName}`);
  }
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Invalid file type'));
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});


