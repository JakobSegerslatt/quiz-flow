import { Injectable, signal } from '@angular/core';

export type SessionPhase =
  | 'lobby'
  | 'question-open'
  | 'question-closed'
  | 'scoreboard'
  | 'finished';

export interface LiveSession {
  id: string;
  code: string;
  phase: SessionPhase;
  participantCount: number;
  currentQuestionIndex: number;
}

@Injectable({ providedIn: 'root' })
export class SessionState {
  readonly currentSession = signal<LiveSession | null>(null);

  setCurrentSession(session: LiveSession): void {
    this.currentSession.set(session);
  }

  clearCurrentSession(): void {
    this.currentSession.set(null);
  }
}
