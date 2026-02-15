import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizBuilderState, SessionState } from '@quiztime/state';

@Component({
  selector: 'lib-admin-dashboard-page',
  imports: [RouterLink],
  template: `
    <section class="space-y-6">
      <header class="space-y-2">
        <h2 class="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p class="text-sm text-slate-600">
          Desktop-first administration area for quiz setup and hosting controls.
        </p>
      </header>

      <div class="grid gap-4 md:grid-cols-3">
        <article class="rounded-xl border border-slate-200 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-500">
            Total Quizzes
          </p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">
            {{ totalQuizzes() }}
          </p>
        </article>

        <article class="rounded-xl border border-slate-200 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-500">
            Draft Questions
          </p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">
            {{ draftQuestions() }}
          </p>
        </article>

        <article class="rounded-xl border border-slate-200 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-500">
            Live Phase
          </p>
          <p class="mt-2 text-lg font-semibold text-slate-900">
            {{ livePhase() }}
          </p>
        </article>
      </div>

      <div class="flex flex-wrap gap-3">
        <a
          class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          routerLink="/admin/quizzes"
          >Manage quizzes</a
        >
        <a
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          routerLink="/host/session/new"
          >Host a session</a
        >
      </div>
    </section>
  `,
})
export class AdminDashboardPage {
  private readonly quizBuilderState = inject(QuizBuilderState);
  private readonly sessionState = inject(SessionState);

  readonly totalQuizzes = this.quizBuilderState.totalQuizzes;
  readonly draftQuestions = computed(
    () => this.quizBuilderState.activeQuiz()?.questions.length ?? 0,
  );
  readonly livePhase = computed(
    () => this.sessionState.currentSession()?.phase ?? 'No active session',
  );
}
