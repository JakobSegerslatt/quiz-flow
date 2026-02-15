import { computed, Injectable, signal } from '@angular/core';

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

export interface QuizValidationResult {
  isValid: boolean;
  errors: string[];
}

const defaultQuestion = (): QuizQuestionDraft => ({
  id: createId('question'),
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  timeLimitSeconds: 20,
});

const createDraft = (): QuizDraft => ({
  id: createId('quiz'),
  title: '',
  questions: [defaultQuestion()],
});

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

@Injectable({ providedIn: 'root' })
export class QuizBuilderState {
  readonly quizzes = signal<QuizDraft[]>([
    {
      id: 'quiz-demo-1',
      title: 'General Knowledge Warmup',
      questions: [
        {
          id: 'q1',
          text: 'What is the capital of Sweden?',
          options: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala'],
          correctIndex: 0,
          timeLimitSeconds: 20,
        },
        {
          id: 'q2',
          text: 'How many continents are there?',
          options: ['5', '6', '7', '8'],
          correctIndex: 2,
          timeLimitSeconds: 15,
        },
      ],
    },
  ]);
  readonly activeQuiz = signal<QuizDraft | null>(null);
  readonly hasActiveQuiz = computed(() => this.activeQuiz() !== null);

  readonly totalQuizzes = computed(() => this.quizzes().length);

  createQuizDraft(): QuizDraft {
    const draft = createDraft();
    this.activeQuiz.set(draft);
    return draft;
  }

  loadQuizForEdit(quizId: string): QuizDraft | null {
    const quiz = this.quizzes().find((item) => item.id === quizId);

    if (!quiz) {
      this.activeQuiz.set(null);
      return null;
    }

    const copy = structuredClone(quiz);
    this.activeQuiz.set(copy);
    return copy;
  }

  setActiveQuiz(quiz: QuizDraft): void {
    this.activeQuiz.set(structuredClone(quiz));
  }

  clear(): void {
    this.activeQuiz.set(null);
  }

  updateActiveTitle(title: string): void {
    const quiz = this.activeQuiz();

    if (!quiz) {
      return;
    }

    this.activeQuiz.set({
      ...quiz,
      title,
    });
  }

  addQuestion(): void {
    const quiz = this.activeQuiz();

    if (!quiz) {
      return;
    }

    this.activeQuiz.set({
      ...quiz,
      questions: [...quiz.questions, defaultQuestion()],
    });
  }

  removeQuestion(questionId: string): void {
    const quiz = this.activeQuiz();

    if (!quiz || quiz.questions.length <= 1) {
      return;
    }

    this.activeQuiz.set({
      ...quiz,
      questions: quiz.questions.filter(
        (question) => question.id !== questionId,
      ),
    });
  }

  moveQuestion(questionId: string, direction: 'up' | 'down'): void {
    const quiz = this.activeQuiz();

    if (!quiz) {
      return;
    }

    const index = quiz.questions.findIndex(
      (question) => question.id === questionId,
    );

    if (index === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= quiz.questions.length) {
      return;
    }

    const questions = [...quiz.questions];
    [questions[index], questions[targetIndex]] = [
      questions[targetIndex],
      questions[index],
    ];

    this.activeQuiz.set({
      ...quiz,
      questions,
    });
  }

  updateQuestion(questionId: string, update: Partial<QuizQuestionDraft>): void {
    const quiz = this.activeQuiz();

    if (!quiz) {
      return;
    }

    this.activeQuiz.set({
      ...quiz,
      questions: quiz.questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              ...update,
            }
          : question,
      ),
    });
  }

  updateQuestionOption(
    questionId: string,
    optionIndex: number,
    value: string,
  ): void {
    const quiz = this.activeQuiz();

    if (!quiz) {
      return;
    }

    this.activeQuiz.set({
      ...quiz,
      questions: quiz.questions.map((question) => {
        if (question.id !== questionId) {
          return question;
        }

        const options = [...question.options];
        options[optionIndex] = value;

        return {
          ...question,
          options,
        };
      }),
    });
  }

  validateQuiz(quiz: QuizDraft): QuizValidationResult {
    const errors: string[] = [];

    if (!quiz.title.trim()) {
      errors.push('Quiz title is required.');
    }

    if (quiz.questions.length === 0) {
      errors.push('At least one question is required.');
    }

    quiz.questions.forEach((question, index) => {
      if (!question.text.trim()) {
        errors.push(`Question ${index + 1} must have text.`);
      }

      const emptyOptions = question.options.filter(
        (option) => !option.trim(),
      ).length;

      if (emptyOptions > 0) {
        errors.push(
          `Question ${index + 1} must have all answer options filled in.`,
        );
      }

      if (
        question.correctIndex < 0 ||
        question.correctIndex > question.options.length - 1
      ) {
        errors.push(`Question ${index + 1} must have a valid correct answer.`);
      }

      if (question.timeLimitSeconds < 5) {
        errors.push(
          `Question ${index + 1} must have a timer of at least 5 seconds.`,
        );
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  saveActiveQuiz(): QuizValidationResult {
    const quiz = this.activeQuiz();

    if (!quiz) {
      return {
        isValid: false,
        errors: ['No active quiz to save.'],
      };
    }

    const validation = this.validateQuiz(quiz);

    if (!validation.isValid) {
      return validation;
    }

    const existing = this.quizzes();
    const index = existing.findIndex((item) => item.id === quiz.id);

    if (index === -1) {
      this.quizzes.set([...existing, structuredClone(quiz)]);
    } else {
      const next = [...existing];
      next[index] = structuredClone(quiz);
      this.quizzes.set(next);
    }

    return {
      isValid: true,
      errors: [],
    };
  }
}
