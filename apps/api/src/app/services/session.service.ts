import {
  badRequest,
  conflict,
  notFound,
} from '../domain/errors';
import {
  Participant,
  Session,
  SessionPhase,
  SessionSummary,
  toSessionSummary,
} from '../domain/session';
import { SessionRepository } from '../repositories/session.repository';

const allowedTransitions: Record<SessionPhase, SessionPhase[]> = {
  lobby: ['question-open'],
  'question-open': ['question-closed'],
  'question-closed': ['scoreboard'],
  scoreboard: ['question-open', 'finished'],
  finished: [],
};

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function createCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class SessionService {
  constructor(private readonly repository: SessionRepository) {}

  createSession(input: { quizId: string; totalQuestions: number }): SessionSummary {
    if (!input.quizId.trim()) {
      throw badRequest('quizId is required.');
    }

    if (!Number.isInteger(input.totalQuestions) || input.totalQuestions <= 0) {
      throw badRequest('totalQuestions must be a positive integer.');
    }

    const now = new Date().toISOString();

    const session: Session = {
      id: createId('session'),
      quizId: input.quizId,
      code: createCode(),
      phase: 'lobby',
      currentQuestionIndex: 0,
      totalQuestions: input.totalQuestions,
      participants: [],
      answers: [],
      createdAt: now,
      updatedAt: now,
    };

    this.repository.create(session);
    return toSessionSummary(session);
  }

  getSessionSummaryById(sessionId: string): SessionSummary {
    const session = this.repository.findById(sessionId);

    if (!session) {
      throw notFound('Session not found.');
    }

    return toSessionSummary(session);
  }

  getSessionSummaryByCode(code: string): SessionSummary {
    const session = this.repository.findByCode(code);

    if (!session) {
      throw notFound('Session not found.');
    }

    return toSessionSummary(session);
  }

  transitionPhase(sessionId: string, phase: SessionPhase): SessionSummary {
    const session = this.repository.findById(sessionId);

    if (!session) {
      throw notFound('Session not found.');
    }

    const allowed = allowedTransitions[session.phase].includes(phase);

    if (!allowed) {
      throw conflict(
        `Invalid phase transition from ${session.phase} to ${phase}.`,
      );
    }

    let nextQuestionIndex = session.currentQuestionIndex;

    if (phase === 'question-open' && session.phase === 'scoreboard') {
      nextQuestionIndex = Math.min(
        session.currentQuestionIndex + 1,
        Math.max(session.totalQuestions - 1, 0),
      );
    }

    const updated: Session = {
      ...session,
      phase,
      currentQuestionIndex: nextQuestionIndex,
      answers:
        phase === 'question-open'
          ? session.answers.filter((answer) => answer.questionIndex !== nextQuestionIndex)
          : session.answers,
      updatedAt: new Date().toISOString(),
    };

    this.repository.update(updated);
    return toSessionSummary(updated);
  }

  joinByCode(input: { code: string; displayName: string }): {
    session: SessionSummary;
    participant: Participant;
  } {
    if (!input.code.trim()) {
      throw badRequest('code is required.');
    }

    if (!input.displayName.trim()) {
      throw badRequest('displayName is required.');
    }

    const session = this.repository.findByCode(input.code);

    if (!session) {
      throw notFound('Invalid or expired session code.');
    }

    const existing = session.participants.find(
      (participant) =>
        participant.displayName.toLowerCase() === input.displayName.toLowerCase(),
    );

    if (existing) {
      throw conflict('Display name is already in use for this session.');
    }

    const participant: Participant = {
      id: createId('participant'),
      displayName: input.displayName.trim(),
      score: 0,
    };

    const updated: Session = {
      ...session,
      participants: [...session.participants, participant],
      updatedAt: new Date().toISOString(),
    };

    this.repository.update(updated);

    return {
      session: toSessionSummary(updated),
      participant,
    };
  }

  submitAnswer(input: {
    sessionId: string;
    participantId: string;
    questionIndex: number;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }): SessionSummary {
    const session = this.repository.findById(input.sessionId);

    if (!session) {
      throw notFound('Session not found.');
    }

    if (session.phase !== 'question-open') {
      throw conflict('Answers are only accepted while a question is open.');
    }

    if (input.questionIndex !== session.currentQuestionIndex) {
      throw badRequest('questionIndex does not match the active question.');
    }

    const participantIndex = session.participants.findIndex(
      (participant) => participant.id === input.participantId,
    );

    if (participantIndex === -1) {
      throw notFound('Participant not found in session.');
    }

    const alreadyAnswered = session.answers.some(
      (answer) =>
        answer.participantId === input.participantId &&
        answer.questionIndex === input.questionIndex,
    );

    if (alreadyAnswered) {
      throw conflict('Participant has already submitted an answer for this question.');
    }

    const participants = [...session.participants];

    if (input.isCorrect) {
      participants[participantIndex] = {
        ...participants[participantIndex],
        score: participants[participantIndex].score + 100,
      };
    }

    const updated: Session = {
      ...session,
      participants,
      answers: [
        ...session.answers,
        {
          participantId: input.participantId,
          questionIndex: input.questionIndex,
          selectedOptionIndex: input.selectedOptionIndex,
          answeredAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    this.repository.update(updated);
    return toSessionSummary(updated);
  }

  getLeaderboard(sessionId: string): Participant[] {
    const session = this.repository.findById(sessionId);

    if (!session) {
      throw notFound('Session not found.');
    }

    return [...session.participants].sort((a, b) => b.score - a.score);
  }
}
