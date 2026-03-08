import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { feedController } from './feed.controller';
import { feedValidation } from './feed.validation';
import { fileUploader } from '../../utils/fileUploader';

const router = express.Router();
const fileFields = fileUploader.upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'files', maxCount: 5 },
]);
// ── Feed CRUD ────────────────────────────────────────────────────────────────

router.post(
  '/',
  auth(),
  fileFields,
  validateRequest(feedValidation.createSchema),
  feedController.createFeed,
);

router.get('/', auth(), feedController.getFeedList);
router.get('/my', auth(), feedController.getMyFeed);
router.get('/:id', auth(), feedController.getFeedById);

router.put(
  '/:id',
  auth(),
  fileFields,
  validateRequest(feedValidation.updateSchema),
  feedController.updateFeed,
);

router.patch(
  '/:id/status',
  auth(),
  validateRequest(feedValidation.changeStatusSchema),
  feedController.changeFeedStatus,
);

router.patch('/:id/pin', auth(), feedController.togglePinFeed);
router.patch('/:id/lock', auth(), feedController.toggleLockFeed);
router.delete('/:id/soft-delete', auth(), feedController.softDeleteFeed);
router.delete('/:id', auth(), feedController.deleteFeed);

// ── Assignment ───────────────────────────────────────────────────────────────

router.post(
  '/:id/assign',
  auth(),
  validateRequest(feedValidation.assignSchema),
  feedController.assignModerator,
);
router.delete(
  '/:id/assign/:moderatorId',
  auth(),
  feedController.removeModerator,
);
router.get('/:id/assignments', auth(), feedController.getFeedAssignments);

// ── Comments ─────────────────────────────────────────────────────────────────

router.post(
  '/:id/comments',
  auth(),
  fileFields,
  validateRequest(feedValidation.commentSchema),
  feedController.createComment,
);
router.get('/:id/comments', auth(), feedController.getFeedComments);
router.put(
  '/:id/comments/:commentId',
  auth(),
  validateRequest(feedValidation.updateCommentSchema),
  feedController.updateComment,
);
router.delete('/:id/comments/:commentId', auth(), feedController.deleteComment);
router.patch(
  '/:id/comments/:commentId/solution',
  auth(),
  feedController.markCommentAsSolution,
);

// ── Reactions ────────────────────────────────────────────────────────────────

router.post('/:id/reactions', auth(), feedController.toggleReaction);

// ── Status History ───────────────────────────────────────────────────────────

router.get('/:id/status-history', auth(), feedController.getFeedStatusHistory);

export const feedRoutes = router;
