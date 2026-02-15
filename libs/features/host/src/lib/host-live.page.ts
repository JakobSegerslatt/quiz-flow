import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-host-live-page',
  template: `
    <section class="space-y-2">
      <h2 class="text-2xl font-semibold text-slate-900">
        Live Session Control
      </h2>
      <p class="text-sm text-slate-600">Session: {{ sessionId }}</p>
      <p class="text-sm text-slate-600">
        Question progression controls and live response metrics come in Epic 2.
      </p>
    </section>
  `,
})
export class HostLivePage {
  private readonly route = inject(ActivatedRoute);
  readonly sessionId =
    this.route.snapshot.paramMap.get('sessionId') ?? 'unknown';
}
