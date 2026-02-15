import { Router } from 'express';
import { badRequest } from '../domain/errors';
import { requireRole } from '../middleware/auth.middleware';
import { SessionService } from '../services/session.service';

export function createPlayRoutes(sessionService: SessionService): Router {
  const router = Router();

  router.post('/join', (request, response, next) => {
    try {
      const { code, displayName } = request.body as {
        code?: string;
        displayName?: string;
      };

      const result = sessionService.joinByCode({
        code: code ?? '',
        displayName: displayName ?? '',
      });

      response.status(201).json({
        data: {
          session: result.session,
          participant: result.participant,
          participantToken: `participant-${result.participant.id}`,
        },
      });
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

  router.post(
    '/sessions/:sessionId/answers',
    requireRole(['participant']),
    (request, response, next) => {
      try {
        const { questionIndex, selectedOptionIndex, isCorrect } = request.body as {
          questionIndex?: number;
          selectedOptionIndex?: number;
          isCorrect?: boolean;
        };

        if (!request.user?.id) {
          throw badRequest('Participant context is missing from token.');
        }

        const session = sessionService.submitAnswer({
          sessionId: request.params.sessionId,
          participantId: request.user.id,
          questionIndex: questionIndex ?? -1,
          selectedOptionIndex: selectedOptionIndex ?? -1,
          isCorrect: Boolean(isCorrect),
        });

        response.status(201).json({ data: session });
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
