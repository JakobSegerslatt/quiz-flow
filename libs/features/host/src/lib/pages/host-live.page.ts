import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthState } from '@quiztime/auth';
import { LiveSession, SessionState } from '@quiztime/state';

@Component({
  selector: 'lib-host-live-page',
  template: `
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold text-slate-900">
        Live Session Control
      </h2>
      <p class="text-sm text-slate-600">Session: {{ sessionId }}</p>

      @if (currentSession(); as session) {
        <div class="grid gap-4 md:grid-cols-4">
          <article class="rounded-xl border border-slate-200 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">Phase</p>
            <p class="mt-2 text-sm font-semibold text-slate-900">
              {{ session.phase }}
            </p>
          </article>
          <article class="rounded-xl border border-slate-200 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">
              Question
            </p>
            <p class="mt-2 text-sm font-semibold text-slate-900">
              {{ session.currentQuestionIndex + 1 }} /
              {{ session.totalQuestions }}
            </p>
          </article>
          <article class="rounded-xl border border-slate-200 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">
              Participants
            </p>
            <p class="mt-2 text-sm font-semibold text-slate-900">
              {{ session.participantCount }}
            </p>
          </article>
          <article class="rounded-xl border border-slate-200 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">
              Responses
            </p>
            <p class="mt-2 text-sm font-semibold text-slate-900">
              {{ session.responsesCount }} / {{ session.participantCount }}
            </p>
          </article>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            type="button"
            (click)="simulateResponses()"
          >
            Simulate responses
          </button>

          <button
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            type="button"
            (click)="closeQuestion()"
          >
            Close question
          </button>

          <button
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            type="button"
            (click)="showScoreboard()"
          >
            Show scoreboard
          </button>

          <button
            class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            type="button"
            (click)="nextQuestion()"
          >
            Next question
          </button>

          <button
            class="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
            type="button"
            (click)="finishSession()"
          >
            End session
          </button>
        </div>
      } @else {
        <p class="text-sm text-slate-600">No active session.</p>
      }
    </section>
  `,
})
export class HostLivePage {
  private readonly route = inject(ActivatedRoute);
  private readonly authState = inject(AuthState);
  private readonly sessionState = inject(SessionState);

  readonly sessionId =
    this.route.snapshot.paramMap.get('sessionId') ?? 'unknown';

  constructor() {
    void this.refresh();
  }

  async simulateResponses(): Promise<void> {
    await this.refresh();
  }

  async closeQuestion(): Promise<void> {
    const accessToken = this.authState.accessToken();

    if (!accessToken) {
      return;
    }

    await this.sessionState.transitionOnServer({
      sessionId: this.sessionId,
      phase: 'question-closed',
      accessToken,
    });
  }

  async showScoreboard(): Promise<void> {
    const accessToken = this.authState.accessToken();

    if (!accessToken) {
      return;
    }

    await this.sessionState.transitionOnServer({
      sessionId: this.sessionId,
      phase: 'scoreboard',
      accessToken,
    });
  }

  async nextQuestion(): Promise<void> {
    const accessToken = this.authState.accessToken();

    if (!accessToken) {
      return;
    }

    await this.sessionState.transitionOnServer({
      sessionId: this.sessionId,
      phase: 'question-open',
      accessToken,
    });
  }

  async finishSession(): Promise<void> {
    const accessToken = this.authState.accessToken();

    if (!accessToken) {
      return;
    }

    await this.sessionState.transitionOnServer({
      sessionId: this.sessionId,
      phase: 'finished',
      accessToken,
    });
  }

  async refresh(): Promise<void> {
    const accessToken = this.authState.accessToken();

    if (!accessToken) {
      return;
    }

    await this.sessionState.refreshAdminSession(this.sessionId, accessToken);
  }

  currentSession(): LiveSession | null {
    return this.sessionState.currentSession();
  }
}
