import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiModeState } from '@quiztime/state';

@Component({
  selector: 'lib-live-shell',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-50">
      <header class="border-b border-slate-800 bg-slate-900/70 px-4 py-3">
        <div
          class="mx-auto flex max-w-md items-center justify-between md:max-w-xl"
        >
          <h1 class="text-base font-semibold">Quiz Time</h1>
          <span class="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase">
            {{ uiMode.mode() }}
          </span>
        </div>
      </header>

      <main class="mx-auto max-w-md p-4 md:max-w-xl">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class LiveShellComponent {
  readonly uiMode = inject(UiModeState);
}
