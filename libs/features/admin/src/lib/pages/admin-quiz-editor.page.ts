import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizBuilderState, QuizQuestionDraft } from '@quiztime/state';

@Component({
  selector: 'lib-admin-quiz-editor-page',
  imports: [FormsModule],
  template: `
    <section class="space-y-4">
      <header class="space-y-2">
        <h2 class="text-2xl font-semibold text-slate-900">{{ heading() }}</h2>
        <p class="text-sm text-slate-600">
          Build multiple-choice questions for hosted sessions.
        </p>
      </header>

      <div class="rounded-xl border border-slate-200 p-4">
        <label class="block text-sm font-medium text-slate-700">
          Quiz title
          <input
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            [ngModel]="activeQuiz()?.title ?? ''"
            (ngModelChange)="updateTitle($any($event))"
            placeholder="Enter quiz title"
          />
        </label>
      </div>

      <div class="space-y-3">
        @for (
          question of activeQuiz()?.questions ?? [];
          track question.id;
          let index = $index
        ) {
          <article class="rounded-xl border border-slate-200 p-4">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-900">
                Question {{ index + 1 }}
              </h3>
              <div class="flex gap-2">
                <button
                  class="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                  type="button"
                  (click)="moveQuestion(question.id, 'up')"
                >
                  Up
                </button>
                <button
                  class="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
                  type="button"
                  (click)="moveQuestion(question.id, 'down')"
                >
                  Down
                </button>
                <button
                  class="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                  type="button"
                  (click)="removeQuestion(question.id)"
                >
                  Remove
                </button>
              </div>
            </div>

            <label class="block text-sm font-medium text-slate-700">
              Question text
              <input
                class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                [ngModel]="question.text"
                (ngModelChange)="updateQuestion(question.id, { text: $event })"
              />
            </label>

            <div class="mt-3 grid gap-2 md:grid-cols-2">
              @for (
                option of question.options;
                track $index;
                let optionIndex = $index
              ) {
                <label class="block text-sm text-slate-700">
                  Option {{ optionIndex + 1 }}
                  <input
                    class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    [ngModel]="option"
                    (ngModelChange)="
                      updateOption(question.id, optionIndex, $event)
                    "
                  />
                </label>
              }
            </div>

            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <label class="block text-sm text-slate-700">
                Correct answer
                <select
                  class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  [ngModel]="question.correctIndex"
                  (ngModelChange)="
                    updateQuestion(question.id, { correctIndex: +$event })
                  "
                >
                  <option [ngValue]="0">Option 1</option>
                  <option [ngValue]="1">Option 2</option>
                  <option [ngValue]="2">Option 3</option>
                  <option [ngValue]="3">Option 4</option>
                </select>
              </label>

              <label class="block text-sm text-slate-700">
                Timer (seconds)
                <input
                  class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  type="number"
                  min="5"
                  [ngModel]="question.timeLimitSeconds"
                  (ngModelChange)="
                    updateQuestion(question.id, { timeLimitSeconds: +$event })
                  "
                />
              </label>
            </div>
          </article>
        }
      </div>

      @if (errors().length > 0) {
        <div
          class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          <p class="font-medium">Please fix the following:</p>
          <ul class="mt-2 list-disc space-y-1 pl-5">
            @for (error of errors(); track $index) {
              <li>{{ error }}</li>
            }
          </ul>
        </div>
      }

      <div class="flex flex-wrap gap-3">
        <button
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          type="button"
          (click)="addQuestion()"
        >
          Add question
        </button>
        <button
          class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          type="button"
          (click)="saveQuiz()"
        >
          Save quiz
        </button>
      </div>
    </section>
  `,
})
export class AdminQuizEditorPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly quizBuilderState = inject(QuizBuilderState);
  readonly errors = signal<string[]>([]);

  readonly heading = computed(() =>
    this.route.snapshot.paramMap.has('quizId') ? 'Edit Quiz' : 'Create Quiz',
  );
  readonly activeQuiz = this.quizBuilderState.activeQuiz;

  constructor() {
    const quizId = this.route.snapshot.paramMap.get('quizId');

    if (quizId) {
      this.quizBuilderState.loadQuizForEdit(quizId);
      return;
    }

    this.quizBuilderState.createQuizDraft();
  }

  addQuestion(): void {
    this.quizBuilderState.addQuestion();
  }

  updateTitle(title: string): void {
    this.quizBuilderState.updateActiveTitle(title);
  }

  removeQuestion(questionId: string): void {
    this.quizBuilderState.removeQuestion(questionId);
  }

  moveQuestion(questionId: string, direction: 'up' | 'down'): void {
    this.quizBuilderState.moveQuestion(questionId, direction);
  }

  updateQuestion(questionId: string, update: Partial<QuizQuestionDraft>): void {
    this.quizBuilderState.updateQuestion(questionId, update);
  }

  updateOption(questionId: string, optionIndex: number, value: string): void {
    this.quizBuilderState.updateQuestionOption(questionId, optionIndex, value);
  }

  async saveQuiz(): Promise<void> {
    const validation = this.quizBuilderState.saveActiveQuiz();
    this.errors.set(validation.errors);

    if (validation.isValid) {
      await this.router.navigate(['/admin/quizzes']);
    }
  }
}
