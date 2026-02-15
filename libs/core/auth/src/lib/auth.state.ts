import { computed, Injectable, signal } from '@angular/core';

export type UserRole = 'admin' | 'host';

export interface AuthUser {
  id: string;
  name: string;
  roles: UserRole[];
}

const ACCESS_TOKEN_KEY = 'quiz-time-access-token';
const USER_NAME_KEY = 'quiz-time-user-name';

@Injectable({ providedIn: 'root' })
export class AuthState {
  private readonly token = signal<string | null>(null);
  private readonly user = signal<AuthUser | null>(null);

  readonly accessToken = computed(() => this.token());
  readonly currentUser = computed(() => this.user());
  readonly isAuthenticated = computed(() => Boolean(this.token()));

  constructor() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const persistedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const persistedName = localStorage.getItem(USER_NAME_KEY) ?? 'Host User';

    if (persistedToken) {
      this.setSession(persistedToken, {
        id: 'host-1',
        name: persistedName,
        roles: ['admin', 'host'],
      });
    }
  }

  hasRole(role: UserRole): boolean {
    return this.user()?.roles.includes(role) ?? false;
  }

  setSession(token: string, user: AuthUser): void {
    this.token.set(token);
    this.user.set(user);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.setItem(USER_NAME_KEY, user.name);
    }
  }

  clearSession(): void {
    this.token.set(null);
    this.user.set(null);

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_NAME_KEY);
    }
  }
}
