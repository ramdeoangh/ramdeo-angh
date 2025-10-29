import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { upload } from '../../infrastructure/files';
import { prisma } from '../../infrastructure/prisma';

const router = Router();

router.get('/', async (_req, res) => {
  const latest = await prisma.cVUpload.findFirst({ orderBy: { uploadedAt: 'desc' } });
  if (!latest) return res.json(null);
  return res.json({ fileName: latest.fileName, mimeType: latest.mimeType, size: latest.size, extractedText: latest.extractedText });
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: { message: 'File required' } });
  const filePath = req.file.path;
  let extractedText: string | null = null;
  if (req.file.mimetype === 'application/pdf') {
    const data = await pdfParse(await fs.readFile(filePath));
    extractedText = data.text;
  } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ path: filePath });
    extractedText = result.value;
  }
  const saved = await prisma.cVUpload.create({ data: {
    fileName: req.file.originalname,
    filePath: path.relative(process.cwd(), filePath),
    mimeType: req.file.mimetype,
    size: req.file.size,
    extractedText
  }});
  return res.json({ fileName: saved.fileName, mimeType: saved.mimeType, size: saved.size, extractedText: saved.extractedText });
});

router.post('/re-extract', async (_req, res) => {
  const latest = await prisma.cVUpload.findFirst({ orderBy: { uploadedAt: 'desc' } });
  if (!latest) return res.status(404).json({ error: { message: 'No CV found' } });
  const abs = path.resolve(process.cwd(), latest.filePath);
  let extractedText: string | null = null;
  if (latest.mimeType === 'application/pdf') {
    const data = await pdfParse(await fs.readFile(abs));
    extractedText = data.text;
  } else if (latest.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ path: abs });
    extractedText = result.value;
  }
  const updated = await prisma.cVUpload.update({ where: { id: latest.id }, data: { extractedText } });
  return res.json({ fileName: updated.fileName, mimeType: updated.mimeType, size: updated.size, extractedText: updated.extractedText });
});

export default router;


