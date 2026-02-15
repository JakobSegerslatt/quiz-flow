import express from 'express';
import { InMemorySessionRepository } from './repositories/in-memory-session.repository';
import { createAdminRoutes } from './routes/admin.routes';
import { createPlayRoutes } from './routes/play.routes';
import { SessionService } from './services/session.service';
import { authenticateRequest } from './middleware/auth.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

export function createApp() {
  const app = express();
  const sessionRepository = new InMemorySessionRepository();
  const sessionService = new SessionService(sessionRepository);

  app.use(express.json());
  app.use(authenticateRequest);

  app.get('/api', (_request, response) => {
    response.json({ message: 'Quiz Flow API' });
  });

  app.use('/api/admin', createAdminRoutes(sessionService));
  app.use('/api/play', createPlayRoutes(sessionService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
