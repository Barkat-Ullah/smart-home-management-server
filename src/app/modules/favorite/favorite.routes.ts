import express from 'express';
import auth from '../../middlewares/auth';
import { favoriteController } from './favorite.controller';
import { UserRoleEnum } from '@prisma/client';

const router = express.Router();

router.post(
  '/:articleId',
  auth(UserRoleEnum.ADMIN, UserRoleEnum.USER),
  favoriteController.createFavorite,
);
router.get('/', auth(), favoriteController.getFavoriteList);

export const favoriteRoutes = router;
