export type SessionPhase =
  | 'lobby'
  | 'question-open'
  | 'question-closed'
  | 'scoreboard'
  | 'finished';

export type UserRole = 'admin' | 'host' | 'participant';

export interface Participant {
  id: string;
  displayName: string;
  score: number;
}

export interface AnswerSubmission {
  participantId: string;
  questionIndex: number;
  selectedOptionIndex: number;
  answeredAt: string;
}

export interface Session {
  id: string;
  quizId: string;
  code: string;
  phase: SessionPhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  participants: Participant[];
  answers: AnswerSubmission[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionSummary {
  id: string;
  quizId: string;
  code: string;
  phase: SessionPhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  participantCount: number;
  responsesCount: number;
}

export function toSessionSummary(session: Session): SessionSummary {
  const responsesCount = session.answers.filter(
    (answer) => answer.questionIndex === session.currentQuestionIndex,
  ).length;

  return {
    id: session.id,
    quizId: session.quizId,
    code: session.code,
    phase: session.phase,
    currentQuestionIndex: session.currentQuestionIndex,
    totalQuestions: session.totalQuestions,
    participantCount: session.participants.length,
    responsesCount,
  };
}
