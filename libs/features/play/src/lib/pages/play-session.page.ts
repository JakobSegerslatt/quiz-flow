import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  QuizBuilderState,
  QuizQuestionDraft,
  SessionState,
} from '@quiztime/state';

@Component({
  selector: 'lib-play-session-page',
  template: `
    <section class="space-y-4 rounded-2xl bg-slate-900 p-4">
      <h2 class="text-lg font-semibold">Live Quiz</h2>
      <p class="text-xs uppercase tracking-wide text-slate-400">Session: {{ sessionId }}</p>

      @if (!session()) {
        <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
          This session is not active.
        </div>
      } @else if (session()!.phase === 'lobby') {
        <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
          Waiting for host to start the first question.
        </div>
      } @else if (session()!.phase === 'question-open' && question()) {
        <article class="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div class="space-y-2">
            <div class="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                class="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                [style.width.%]="progressPercent()"
              ></div>
            </div>
            <p class="text-xs text-slate-400">{{ secondsLeft() }}s left</p>
          </div>

          <h3 class="text-base font-semibold text-slate-100">
            {{ question()!.text }}
          </h3>

          <div class="grid grid-cols-1 gap-2">
            @for (option of question()!.options; track $index; let i = $index) {
              <button
                class="rounded-xl border px-3 py-4 text-left text-sm font-medium transition"
                [class.border-indigo-400]="selectedOptionIndex() === i"
                [class.bg-indigo-500/20]="selectedOptionIndex() === i"
                [class.border-slate-700]="selectedOptionIndex() !== i"
                [class.bg-slate-900]="selectedOptionIndex() !== i"
                [disabled]="isLocked()"
                type="button"
                (click)="selectAnswer(i)"
              >
                {{ option }}
              </button>
            }
          </div>

          <button
            class="w-full rounded-xl bg-indigo-500 px-3 py-3 text-sm font-semibold text-white disabled:opacity-50"
            type="button"
            [disabled]="selectedOptionIndex() === null || isLocked()"
            (click)="lockAnswer()"
          >
            Lock answer
          </button>
        </article>
      } @else if (session()!.phase === 'question-closed' && question()) {
        <article class="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <h3 class="text-base font-semibold text-slate-100">Answer Result</h3>
          <p class="text-sm text-slate-300">
            @if (isAnswerCorrect()) {
              Correct! Nice work.
            } @else {
              Not correct this time.
            }
          </p>
          <p class="text-xs text-slate-400">
            Correct answer: {{ question()!.options[question()!.correctIndex] }}
          </p>
        </article>
      } @else if (session()!.phase === 'scoreboard') {
        <article class="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <h3 class="text-base font-semibold text-slate-100">Scoreboard</h3>
          <p class="text-sm text-slate-300">Your score: {{ localScore() }}</p>
          <p class="text-xs text-slate-400">Next question starts shortly.</p>
        </article>
      } @else if (session()!.phase === 'finished') {
        <article class="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <h3 class="text-base font-semibold text-slate-100">Quiz finished</h3>
          <p class="text-sm text-slate-300">Final score: {{ localScore() }}</p>
        </article>
      }
    </section>
  `,
})
export class PlaySessionPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionState = inject(SessionState);
  private readonly quizBuilderState = inject(QuizBuilderState);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly initialQuestionTime = signal(20);

  readonly secondsLeft = signal(20);
  readonly selectedOptionIndex = signal<number | null>(null);
  readonly isLocked = signal(false);
  readonly localScore = signal(0);

  readonly session = this.sessionState.currentSession;
  readonly question = computed<QuizQuestionDraft | null>(() => {
    const activeSession = this.session();

    if (!activeSession) {
      return null;
    }

    const quiz = this.quizBuilderState
      .quizzes()
      .find((item) => item.id === activeSession.quizId);

    if (!quiz) {
      return null;
    }

    return quiz.questions[activeSession.currentQuestionIndex] ?? null;
  });

  readonly progressPercent = computed(() => {
    const initial = this.initialQuestionTime();

    if (initial <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, (this.secondsLeft() / initial) * 100));
  });

  readonly isAnswerCorrect = computed(() => {
    const currentQuestion = this.question();
    const selected = this.selectedOptionIndex();

    if (!currentQuestion || selected === null) {
      return false;
    }

    return currentQuestion.correctIndex === selected;
  });

  readonly sessionId =
    this.route.snapshot.paramMap.get('sessionId') ?? 'unknown';

  constructor() {
    void this.sessionState.refreshPlaySession(this.sessionId);
    this.startPolling();

    effect(() => {
      const activeSession = this.session();
      const currentQuestion = this.question();

      if (!activeSession || !currentQuestion) {
        this.stopTimer();
        return;
      }

      if (activeSession.phase === 'question-open') {
        this.initialQuestionTime.set(currentQuestion.timeLimitSeconds);
        this.secondsLeft.set(currentQuestion.timeLimitSeconds);
        this.selectedOptionIndex.set(null);
        this.isLocked.set(false);
        this.startTimer();
      } else {
        this.stopTimer();
      }
    });

    effect(() => {
      if (this.session()?.phase === 'scoreboard') {
        this.selectedOptionIndex.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopPolling();
  }

  selectAnswer(index: number): void {
    if (this.isLocked()) {
      return;
    }

    this.selectedOptionIndex.set(index);
  }

  async lockAnswer(): Promise<void> {
    if (this.selectedOptionIndex() === null || this.isLocked()) {
      return;
    }

    this.isLocked.set(true);
    const currentSession = this.session();
    const selectedOptionIndex = this.selectedOptionIndex();

    if (currentSession && selectedOptionIndex !== null) {
      await this.sessionState.submitAnswerOnServer({
        sessionId: currentSession.id,
        questionIndex: currentSession.currentQuestionIndex,
        selectedOptionIndex,
        isCorrect: this.isAnswerCorrect(),
      });
    }

    if (this.isAnswerCorrect()) {
      this.localScore.update((value) => value + 100);
    }
  }

  private startTimer(): void {
    this.stopTimer();

    this.intervalId = setInterval(() => {
      const next = this.secondsLeft() - 1;

      if (next <= 0) {
        this.secondsLeft.set(0);
        this.isLocked.set(true);
        this.stopTimer();
        return;
      }

      this.secondsLeft.set(next);
    }, 1000);
  }

  private startPolling(): void {
    this.stopPolling();

    this.pollIntervalId = setInterval(() => {
      void this.sessionState.refreshPlaySession(this.sessionId);
    }, 2000);
  }

  private stopPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  private stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
