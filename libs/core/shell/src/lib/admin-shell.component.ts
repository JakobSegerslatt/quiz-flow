import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthState } from '@quiztime/auth';
import { UiModeState } from '@quiztime/state';

@Component({
  selector: 'lib-admin-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-100 text-slate-900">
      <header class="border-b border-slate-200 bg-white px-6 py-4">
        <div class="mx-auto flex max-w-7xl items-center justify-between">
          <h1 class="text-xl font-semibold">Quiz Time Admin</h1>
          <div class="text-sm text-slate-600">
            Mode: <span class="font-medium uppercase">{{ uiMode.mode() }}</span>
          </div>
        </div>
      </header>

      <div class="mx-auto grid max-w-7xl gap-4 p-6 lg:grid-cols-[240px_1fr]">
        <aside class="rounded-xl border border-slate-200 bg-white p-4">
          <nav class="space-y-1">
            <a
              class="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
              routerLink="/admin/dashboard"
              routerLinkActive="bg-slate-900 text-white"
              >Dashboard</a
            >
            <a
              class="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
              routerLink="/admin/quizzes"
              routerLinkActive="bg-slate-900 text-white"
              >Quizzes</a
            >
            <a
              class="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100"
              routerLink="/host/session/new"
              routerLinkActive="bg-slate-900 text-white"
              >Host Session</a
            >
          </nav>

          <button
            class="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
            type="button"
            (click)="logout()"
          >
            Sign out
          </button>
        </aside>

        <main class="rounded-xl border border-slate-200 bg-white p-4">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class AdminShellComponent {
  readonly uiMode = inject(UiModeState);
  private readonly authState = inject(AuthState);

  logout(): void {
    this.authState.clearSession();
  }
}
