import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionState } from '@quiztime/state';

@Component({
  selector: 'lib-play-join-page',
  imports: [FormsModule],
  template: `
    <section class="space-y-4 rounded-2xl bg-slate-900 p-4">
      <h2 class="text-lg font-semibold">Join quiz</h2>
      <p class="text-sm text-slate-300">Mobile-first join flow foundation.</p>

      <form class="space-y-3" (ngSubmit)="join()">
        <label class="block text-sm">
          Session code
          <input
            class="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3"
            name="code"
            [(ngModel)]="code"
            required
          />
        </label>

        <label class="block text-sm">
          Display name
          <input
            class="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3"
            name="name"
            [(ngModel)]="displayName"
            required
          />
        </label>

        <button
          class="w-full rounded-xl bg-indigo-500 px-3 py-3 text-sm font-medium text-white"
          type="submit"
        >
          Join
        </button>
      </form>
    </section>
  `,
})
export class PlayJoinPage {
  code = '';
  displayName = '';
  error = '';
  private readonly router = inject(Router);
  private readonly sessionState = inject(SessionState);

  async join(): Promise<void> {
    this.error = '';

    if (!this.code.trim() || !this.displayName.trim()) {
      this.error = 'Please enter both session code and display name.';
      return;
    }

    const session = this.sessionState.getSessionByCode(this.code.trim());

    if (!session) {
      this.error = 'Invalid or expired session code.';
      return;
    }

    this.sessionState.updateParticipantCount(session.participantCount + 1);
    await this.router.navigate(['/play/session', session.id]);
  }
}
