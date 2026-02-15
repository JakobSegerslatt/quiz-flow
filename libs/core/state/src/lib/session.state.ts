import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

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

interface ApiEnvelope<T> {
  data: T;
}

interface JoinResult {
  session: LiveSession;
  participant: {
    id: string;
    displayName: string;
    score: number;
  };
  participantToken: string;
}

const phaseTransitions: Record<SessionPhase, SessionPhase[]> = {
  lobby: ['question-open'],
  'question-open': ['question-closed'],
  'question-closed': ['scoreboard'],
  scoreboard: ['question-open', 'finished'],
  finished: [],
};

const PARTICIPANT_TOKEN_KEY = 'quiz-time-participant-token';
const PARTICIPANT_ID_KEY = 'quiz-time-participant-id';

@Injectable({ providedIn: 'root' })
export class SessionState {
  private readonly httpClient = inject(HttpClient);
  private readonly apiBaseUrl = '/api';

  readonly currentSession = signal<LiveSession | null>(null);
  readonly participantToken = signal<string | null>(null);
  readonly participantId = signal<string | null>(null);
  readonly canTransition = computed(() => {
    const session = this.currentSession();

    if (!session) {
      return false;
    }

    return phaseTransitions[session.phase].length > 0;
  });

  constructor() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    this.participantToken.set(localStorage.getItem(PARTICIPANT_TOKEN_KEY));
    this.participantId.set(localStorage.getItem(PARTICIPANT_ID_KEY));
  }

  setCurrentSession(session: LiveSession): void {
    this.currentSession.set(session);
  }

  clearCurrentSession(): void {
    this.currentSession.set(null);
  }

  async createSessionOnServer(input: {
    quizId: string;
    totalQuestions: number;
    accessToken: string;
  }): Promise<LiveSession> {
    const response = await firstValueFrom(
      this.httpClient.post<ApiEnvelope<LiveSession>>(
        `${this.apiBaseUrl}/admin/sessions`,
        {
          quizId: input.quizId,
          totalQuestions: input.totalQuestions,
        },
        {
          headers: this.createAuthHeaders(input.accessToken),
        },
      ),
    );

    this.currentSession.set(response.data);
    return response.data;
  }

  async joinByCode(input: {
    code: string;
    displayName: string;
  }): Promise<JoinResult> {
    const response = await firstValueFrom(
      this.httpClient.post<ApiEnvelope<JoinResult>>(
        `${this.apiBaseUrl}/play/join`,
        {
          code: input.code,
          displayName: input.displayName,
        },
      ),
    );

    const result = response.data;
    this.currentSession.set(result.session);
    this.participantToken.set(result.participantToken);
    this.participantId.set(result.participant.id);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PARTICIPANT_TOKEN_KEY, result.participantToken);
      localStorage.setItem(PARTICIPANT_ID_KEY, result.participant.id);
    }

    return result;
  }

  async refreshAdminSession(
    sessionId: string,
    accessToken: string,
  ): Promise<LiveSession> {
    const response = await firstValueFrom(
      this.httpClient.get<ApiEnvelope<LiveSession>>(
        `${this.apiBaseUrl}/admin/sessions/${sessionId}`,
        {
          headers: this.createAuthHeaders(accessToken),
        },
      ),
    );

    this.currentSession.set(response.data);
    return response.data;
  }

  async refreshPlaySession(sessionId: string): Promise<LiveSession> {
    const response = await firstValueFrom(
      this.httpClient.get<ApiEnvelope<LiveSession>>(
        `${this.apiBaseUrl}/play/sessions/${sessionId}`,
      ),
    );

    this.currentSession.set(response.data);
    return response.data;
  }

  async transitionOnServer(input: {
    sessionId: string;
    phase: SessionPhase;
    accessToken: string;
  }): Promise<LiveSession> {
    const current = this.currentSession();

    if (current) {
      const allowed =
        phaseTransitions[current.phase]?.includes(input.phase) ?? false;

      if (!allowed) {
        return current;
      }
    }

    const response = await firstValueFrom(
      this.httpClient.post<ApiEnvelope<LiveSession>>(
        `${this.apiBaseUrl}/admin/sessions/${input.sessionId}/phase`,
        {
          phase: input.phase,
        },
        {
          headers: this.createAuthHeaders(input.accessToken),
        },
      ),
    );

    this.currentSession.set(response.data);
    return response.data;
  }

  async submitAnswerOnServer(input: {
    sessionId: string;
    questionIndex: number;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }): Promise<LiveSession> {
    const token = this.participantToken();

    if (!token) {
      throw new Error(
        'Missing participant token. Please join the session first.',
      );
    }

    const response = await firstValueFrom(
      this.httpClient.post<ApiEnvelope<LiveSession>>(
        `${this.apiBaseUrl}/play/sessions/${input.sessionId}/answers`,
        {
          questionIndex: input.questionIndex,
          selectedOptionIndex: input.selectedOptionIndex,
          isCorrect: input.isCorrect,
        },
        {
          headers: this.createAuthHeaders(token),
        },
      ),
    );

    this.currentSession.set(response.data);
    return response.data;
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

  private createAuthHeaders(accessToken: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  }
}
