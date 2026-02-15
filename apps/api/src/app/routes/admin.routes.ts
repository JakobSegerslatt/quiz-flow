import { Router } from 'express';
import { SessionPhase } from '../domain/session';
import { requireRole } from '../middleware/auth.middleware';
import { SessionService } from '../services/session.service';

export function createAdminRoutes(sessionService: SessionService): Router {
  const router = Router();

  router.use(requireRole(['admin', 'host']));

  router.post('/sessions', (request, response, next) => {
    try {
      const { quizId, totalQuestions } = request.body as {
        quizId?: string;
        totalQuestions?: number;
      };

      const session = sessionService.createSession({
        quizId: quizId ?? '',
        totalQuestions: totalQuestions ?? 0,
      });

      response.status(201).json({ data: session });
    } catch (error) {
      next(error);
    }
  });

  router.get('/sessions/:sessionId', (request, response, next) => {
    try {
      const session = sessionService.getSessionSummaryById(request.params.sessionId);
      response.json({ data: session });
    } catch (error) {
      next(error);
    }
  });

  router.post('/sessions/:sessionId/phase', (request, response, next) => {
    try {
      const { phase } = request.body as { phase?: SessionPhase };
      const session = sessionService.transitionPhase(
        request.params.sessionId,
        phase ?? 'lobby',
      );

      response.json({ data: session });
    } catch (error) {
      next(error);
    }
  });

  router.get('/sessions/:sessionId/leaderboard', (request, response, next) => {
    try {
      const leaderboard = sessionService.getLeaderboard(request.params.sessionId);
      response.json({ data: leaderboard });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
