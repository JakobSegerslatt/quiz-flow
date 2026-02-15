import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizBuilderState, QuizDraft } from '@quiztime/state';

@Component({
  selector: 'lib-admin-quizzes-page',
  imports: [RouterLink],
  template: `
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-slate-900">Quizzes</h2>
        <a
          class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          routerLink="/admin/quizzes/new"
          >Create quiz</a
        >
      </div>

      <div class="overflow-hidden rounded-xl border border-slate-200">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-100 text-slate-600">
            <tr>
              <th class="px-4 py-3 font-medium">Title</th>
              <th class="px-4 py-3 font-medium">Questions</th>
              <th class="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (quiz of quizzes(); track quiz.id) {
              <tr class="border-t border-slate-200">
                <td class="px-4 py-3 text-slate-900">{{ quiz.title }}</td>
                <td class="px-4 py-3 text-slate-600">
                  {{ quiz.questions.length }}
                </td>
                <td class="px-4 py-3">
                  <a
                    class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    [routerLink]="['/admin/quizzes', quiz.id, 'edit']"
                    >Edit</a
                  >
                </td>
              </tr>
            } @empty {
              <tr>
                <td class="px-4 py-6 text-slate-600" colspan="3">
                  No quizzes yet. Create your first quiz.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class AdminQuizzesPage {
  private readonly quizBuilderState = inject(QuizBuilderState);

  quizzes(): QuizDraft[] {
    return this.quizBuilderState.quizzes();
  }
}
