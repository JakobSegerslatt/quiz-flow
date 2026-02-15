import { Session } from '../domain/session';
import { SessionRepository } from './session.repository';

export class InMemorySessionRepository implements SessionRepository {
  private readonly byId = new Map<string, Session>();
  private readonly byCode = new Map<string, string>();

  create(session: Session): Session {
    this.byId.set(session.id, session);
    this.byCode.set(session.code.toLowerCase(), session.id);
    return session;
  }

  findById(sessionId: string): Session | null {
    return this.byId.get(sessionId) ?? null;
  }

  findByCode(code: string): Session | null {
    const id = this.byCode.get(code.toLowerCase());

    if (!id) {
      return null;
    }

    return this.byId.get(id) ?? null;
  }

  update(session: Session): Session {
    this.byId.set(session.id, session);
    this.byCode.set(session.code.toLowerCase(), session.id);
    return session;
  }
}
