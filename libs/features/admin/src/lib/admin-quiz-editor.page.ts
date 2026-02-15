import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-admin-quiz-editor-page',
  template: `
    <section class="space-y-2">
      <h2 class="text-2xl font-semibold text-slate-900">{{ heading() }}</h2>
      <p class="text-sm text-slate-600">
        Desktop quiz editor shell is ready; question builder UI comes in Epic 2.
      </p>
    </section>
  `,
})
export class AdminQuizEditorPage {
  private readonly route = inject(ActivatedRoute);
  readonly heading = computed(() =>
    this.route.snapshot.paramMap.has('quizId') ? 'Edit Quiz' : 'Create Quiz',
  );
}
