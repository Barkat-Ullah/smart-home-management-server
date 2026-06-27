import express, { Application } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import {
  apiLimiter,
  documentUpload,
  notFound,
  requestLogger,
  serverHealth,
  setupMiddlewares,
} from './shared';
import { rootHandler } from './shared/rootHandler';
import { fileUploader } from './app/utils/fileUploader';
import auth from './app/middlewares/auth';
import { bullBoard, bullBoardBasePath } from './helpers/queueMonitor/bullBoard';
// import { StripeWebHook } from './app/utils/StripeUtils';

const app: Application = express();

// Stripe webhook (if needed, before error handler)
app.post(
  '/api/v1/stripe/webhook',
  express.raw({ type: 'application/json' }),
  // StripeWebHook,
);

setupMiddlewares(app);
app.use(bullBoardBasePath, bullBoard);
// Request logging
app.use(requestLogger);
app.set('trust proxy', 1);
app.use('/api/v1', apiLimiter, router);

// Upload route (after main routes, before error handler)
app.post(
  '/api/v1/upload-document',
  auth(),
  fileUploader.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'files', maxCount: 1 },
  ]),
  documentUpload,
);

// Root route (Better: JSON response with icon)
// app.get('/', (req, res) => {
//   res.send({
//     Message: 'The server is running. . .',
//   });
// });

app.get('/', rootHandler);
app.get('/health', serverHealth);

// 404 handler (before global error)
app.use(notFound);

// Global error handler (last)
app.use(globalErrorHandler);

export default app;
