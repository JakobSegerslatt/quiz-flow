import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LiveSession, SessionState } from '@quiztime/state';

@Component({
  selector: 'lib-host-lobby-page',
  imports: [RouterLink],
  template: `
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold text-slate-900">Session Lobby</h2>
      <p class="text-sm text-slate-600">Session: {{ sessionId }}</p>

      @if (currentSession(); as session) {
        <div class="grid gap-4 md:grid-cols-3">
          <article class="rounded-xl border border-slate-200 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">
              Join Code
            </p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">
              {{ session.code }}
            </p>
          </article>

          <article class="rounded-xl border border-slate-200 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">
              Participants
            </p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">
              {{ session.participantCount }}
            </p>
          </article>

          <article class="rounded-xl border border-slate-200 p-4">
            <p class="text-xs uppercase tracking-wide text-slate-500">Phase</p>
            <p class="mt-2 text-lg font-semibold text-slate-900">
              {{ session.phase }}
            </p>
          </article>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            type="button"
            (click)="incrementParticipants()"
          >
            +1 participant
          </button>
          <button
            class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            type="button"
            (click)="openFirstQuestion()"
          >
            Start first question
          </button>
          <a
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            [routerLink]="['/host/session', session.id, 'live']"
            >Go to live control</a
          >
        </div>
      } @else {
        <p class="text-sm text-slate-600">
          No active session. Start one from "Host Session".
        </p>
      }
    </section>
  `,
})
export class HostLobbyPage {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionState = inject(SessionState);

  readonly sessionId =
    this.route.snapshot.paramMap.get('sessionId') ?? 'unknown';

  incrementParticipants(): void {
    const current = this.currentSession();

    if (!current) {
      return;
    }

    this.sessionState.updateParticipantCount(current.participantCount + 1);
  }

  openFirstQuestion(): void {
    this.sessionState.transitionTo('question-open');
  }

  currentSession(): LiveSession | null {
    return this.sessionState.currentSession();
  }
}
