import { Session } from '../domain/session';

export interface SessionRepository {
  create(session: Session): Session;
  findById(sessionId: string): Session | null;
  findByCode(code: string): Session | null;
  update(session: Session): Session;
}
