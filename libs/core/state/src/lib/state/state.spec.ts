import { SessionState } from '../session.state';

describe('SessionState', () => {
  it('starts a session with quiz metadata', () => {
    const state = new SessionState();
    const session = state.startSession(5, 'quiz-1');

    expect(session.totalQuestions).toBe(5);
    expect(session.quizId).toBe('quiz-1');
    expect(session.phase).toBe('lobby');
  });
});
