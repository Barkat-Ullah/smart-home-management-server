import express, { RequestHandler } from 'express';
import { askGroq } from './ai.controller';

const router = express.Router();

router.post('/', askGroq as unknown as RequestHandler);

export const aiRoutes = router;
