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
router.patch('/:id/soft-delete', auth(), feedController.softDeleteFeed);
router.delete('/:id', auth(), feedController.deleteFeed);

export const feedRoutes = router;
