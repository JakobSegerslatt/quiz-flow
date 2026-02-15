import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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

      <p class="text-sm text-slate-600">
        Quiz list and management table will be implemented in Epic 2.
      </p>
    </section>
  `,
})
export class AdminQuizzesPage {}
