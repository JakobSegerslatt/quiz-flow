import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthState } from '@quiztime/auth';
import { QuizBuilderState, SessionState } from '@quiztime/state';

@Component({
  selector: 'lib-host-new-session-page',
  imports: [FormsModule],
  template: `
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold text-slate-900">Start Session</h2>
      <p class="text-sm text-slate-600">
        Choose a quiz and create a live session for participants.
      </p>

      <label class="block max-w-lg text-sm font-medium text-slate-700">
        Quiz
        <select
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          [(ngModel)]="selectedQuizId"
          name="selectedQuiz"
        >
          @for (quiz of quizzes(); track quiz.id) {
            <option [value]="quiz.id">
              {{ quiz.title }} ({{ quiz.questions.length }} questions)
            </option>
          }
        </select>
      </label>

      <button
        class="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        type="button"
        [disabled]="!canStart()"
        (click)="startSession()"
      >
        Start session
      </button>
    </section>
  `,
})
export class HostNewSessionPage {
  private readonly router = inject(Router);
  private readonly authState = inject(AuthState);
  private readonly quizBuilderState = inject(QuizBuilderState);
  private readonly sessionState = inject(SessionState);

  readonly quizzes = this.quizBuilderState.quizzes;
  selectedQuizId = this.quizzes()[0]?.id ?? '';

  readonly canStart = computed(() => Boolean(this.selectedQuizId));

  async startSession(): Promise<void> {
    const quiz = this.quizzes().find((item) => item.id === this.selectedQuizId);
    const accessToken = this.authState.accessToken();

    if (!quiz || !accessToken) {
      return;
    }

    const session = await this.sessionState.createSessionOnServer({
      quizId: quiz.id,
      totalQuestions: quiz.questions.length,
      accessToken,
    });

    await this.router.navigate(['/host/session', session.id, 'lobby']);
  }
}
