import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-host-new-session-page',
  imports: [RouterLink],
  template: `
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold text-slate-900">Start Session</h2>
      <p class="text-sm text-slate-600">
        Host controls are desktop-first and protected by auth guard.
      </p>

      <a
        class="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        routerLink="/host/session/demo/lobby"
      >
        Start demo session
      </a>
    </section>
  `,
})
export class HostNewSessionPage {}
