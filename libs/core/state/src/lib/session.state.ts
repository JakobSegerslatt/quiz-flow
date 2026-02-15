import { computed, Injectable, signal } from '@angular/core';

export type SessionPhase =
  | 'lobby'
  | 'question-open'
  | 'question-closed'
  | 'scoreboard'
  | 'finished';

export interface LiveSession {
  id: string;
  quizId: string;
  code: string;
  phase: SessionPhase;
  participantCount: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  responsesCount: number;
}

const phaseTransitions: Record<SessionPhase, SessionPhase[]> = {
  lobby: ['question-open'],
  'question-open': ['question-closed'],
  'question-closed': ['scoreboard'],
  scoreboard: ['question-open', 'finished'],
  finished: [],
};

function createSessionId(): string {
  return `session-${Math.random().toString(36).slice(2, 8)}`;
}

function createSessionCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable({ providedIn: 'root' })
export class SessionState {
  readonly currentSession = signal<LiveSession | null>(null);
  readonly canTransition = computed(() => {
    const session = this.currentSession();

    if (!session) {
      return false;
    }

    return phaseTransitions[session.phase].length > 0;
  });

  setCurrentSession(session: LiveSession): void {
    this.currentSession.set(session);
  }

  clearCurrentSession(): void {
    this.currentSession.set(null);
  }

  startSession(totalQuestions: number, quizId: string): LiveSession {
    const nextSession: LiveSession = {
      id: createSessionId(),
      quizId,
      code: createSessionCode(),
      phase: 'lobby',
      participantCount: 0,
      currentQuestionIndex: 0,
      totalQuestions,
      responsesCount: 0,
    };

    this.currentSession.set(nextSession);
    return nextSession;
  }

  getSessionByCode(code: string): LiveSession | null {
    const session = this.currentSession();

    if (!session) {
      return null;
    }

    return session.code.toLowerCase() === code.toLowerCase() ? session : null;
  }

  transitionTo(nextPhase: SessionPhase): boolean {
    const session = this.currentSession();

    if (!session) {
      return false;
    }

    const allowed = phaseTransitions[session.phase].includes(nextPhase);

    if (!allowed) {
      return false;
    }

    if (nextPhase === 'question-open') {
      const nextQuestionIndex =
        session.phase === 'scoreboard'
          ? Math.min(
              session.currentQuestionIndex + 1,
              Math.max(session.totalQuestions - 1, 0),
            )
          : session.currentQuestionIndex;

      this.currentSession.set({
        ...session,
        phase: nextPhase,
        currentQuestionIndex: nextQuestionIndex,
        responsesCount: 0,
      });

      return true;
    }

    this.currentSession.set({
      ...session,
      phase: nextPhase,
    });

    return true;
  }

  updateParticipantCount(participantCount: number): void {
    const session = this.currentSession();

    if (!session) {
      return;
    }

    this.currentSession.set({
      ...session,
      participantCount,
    });
  }

  updateResponsesCount(responsesCount: number): void {
    const session = this.currentSession();

    if (!session) {
      return;
    }

    this.currentSession.set({
      ...session,
      responsesCount,
    });
  }
}
