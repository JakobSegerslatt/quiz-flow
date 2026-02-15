import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-host-lobby-page',
  template: `
    <section class="space-y-2">
      <h2 class="text-2xl font-semibold text-slate-900">Session Lobby</h2>
      <p class="text-sm text-slate-600">Session: {{ sessionId }}</p>
      <p class="text-sm text-slate-600">
        Lobby and participant readiness controls will be implemented in Epic 2.
      </p>
    </section>
  `,
})
export class HostLobbyPage {
  private readonly route = inject(ActivatedRoute);
  readonly sessionId =
    this.route.snapshot.paramMap.get('sessionId') ?? 'unknown';
}
