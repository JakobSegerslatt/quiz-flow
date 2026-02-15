import { Injectable, signal } from '@angular/core';

export interface QuizQuestionDraft {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSeconds: number;
}

export interface QuizDraft {
  id: string;
  title: string;
  questions: QuizQuestionDraft[];
}

@Injectable({ providedIn: 'root' })
export class QuizBuilderState {
  readonly activeQuiz = signal<QuizDraft | null>(null);

  setActiveQuiz(quiz: QuizDraft): void {
    this.activeQuiz.set(quiz);
  }

  clear(): void {
    this.activeQuiz.set(null);
  }
}
