import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-play-session-page',
  template: `
    <section class="space-y-4 rounded-2xl bg-slate-900 p-4">
      <h2 class="text-lg font-semibold">Live Question</h2>
      <p class="text-sm text-slate-300">Session: {{ sessionId }}</p>
      <p class="text-sm text-slate-300">
        Mobile answer cards, timer, and feedback transitions are implemented in
        Epic 3.
      </p>
    </section>
  `,
})
export class PlaySessionPage {
  private readonly route = inject(ActivatedRoute);
  readonly sessionId =
    this.route.snapshot.paramMap.get('sessionId') ?? 'unknown';
}
