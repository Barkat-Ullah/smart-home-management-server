import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { articleController } from './article.controller';
import { articleValidation } from './article.validation';
import { fileUploader } from '../../utils/fileUploader';

const router = express.Router();

const fileUpload = fileUploader.upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'files', maxCount: 1 },
]);

// ── AI generation ─────────────────────────────────────────────────────────────
router.post('/generate', auth(), articleController.generateArticle);

// ── Feed (isKept = true articles) ─────────────────────────────────────────────
router.get('/feed-activity', auth(), articleController.getFeedArticles);

// ── My saved articles ─────────────────────────────────────────────────────────
router.get('/saved', auth(), articleController.getMySavedArticles);

// ── My articles ───────────────────────────────────────────────────────────────
router.get('/my', auth(), articleController.getMyArticle);

// ── Manual create ─────────────────────────────────────────────────────────────
router.post(
  '/',
  auth(),
  fileUpload,
  validateRequest(articleValidation.createSchema),
  articleController.createArticle,
);

// ── List all (admin) ──────────────────────────────────────────────────────────
router.get('/', auth(), articleController.getArticleList);

// ── Single article ────────────────────────────────────────────────────────────
router.get('/:id', auth(), articleController.getArticleById);

// ── Update ────────────────────────────────────────────────────────────────────
router.put(
  '/:id',
  auth(),
  fileUpload,
  validateRequest(articleValidation.updateSchema),
  articleController.updateArticle,
);

// ── Admin keep → publish to feed ──────────────────────────────────────────────
router.patch('/keep/:id', auth(), articleController.keepArticle);

// ── Save / unsave (toggle) ────────────────────────────────────────────────────
router.patch('/save/:id', auth(), articleController.toggleSaveArticle);

// ── Toggle status (Pending ↔ Complete) ────────────────────────────────────────
router.patch(
  '/toggle-status/:id',
  auth(),
  articleController.toggleStatusArticle,
);

// ── Soft delete ───────────────────────────────────────────────────────────────
router.delete('/soft-delete/:id', auth(), articleController.softDeleteArticle);

// ── Hard delete ───────────────────────────────────────────────────────────────
router.delete('/:id', auth(), articleController.deleteArticle);

export const articleRoutes = router;
