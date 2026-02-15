import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthState } from '@quiztime/auth';

@Component({
  selector: 'lib-admin-login-page',
  imports: [FormsModule],
  template: `
    <div
      class="mx-auto mt-14 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 class="text-xl font-semibold text-slate-900">Admin Sign in</h2>
      <p class="mt-1 text-sm text-slate-600">
        Use JWT auth flow (stubbed for Epic 1).
      </p>

      <form class="mt-6 space-y-4" (ngSubmit)="signIn()">
        <label class="block text-sm text-slate-700">
          Name
          <input
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            name="name"
            [(ngModel)]="name"
            required
          />
        </label>

        <button
          class="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          type="submit"
        >
          Sign in
        </button>
      </form>
    </div>
  `,
})
export class AdminLoginPage {
  name = 'Host User';
  private readonly authState = inject(AuthState);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly loading = signal(false);

  async signIn(): Promise<void> {
    this.loading.set(true);

    this.authState.setSession('demo-jwt-token', {
      id: 'host-1',
      name: this.name,
      roles: ['admin', 'host'],
    });

    const redirectTarget = this.route.snapshot.queryParamMap.get('redirect');

    await this.router.navigateByUrl(redirectTarget ?? '/admin/dashboard');
    this.loading.set(false);
  }
}
