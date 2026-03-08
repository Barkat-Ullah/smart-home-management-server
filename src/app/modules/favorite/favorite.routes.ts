import express from 'express';
import auth from '../../middlewares/auth';
import { favoriteController } from './favorite.controller';


const router = express.Router();

router.post(
  '/:articleId',
  auth(),
  favoriteController.createFavorite,
);
router.get('/', auth(), favoriteController.getFavoriteList);

export const favoriteRoutes = router;
