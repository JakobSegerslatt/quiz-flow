import { Injectable, signal } from '@angular/core';

export interface LeaderboardEntry {
  participantId: string;
  displayName: string;
  score: number;
  rank: number;
}

@Injectable({ providedIn: 'root' })
export class LeaderboardState {
  readonly entries = signal<LeaderboardEntry[]>([]);

  setEntries(entries: LeaderboardEntry[]): void {
    this.entries.set(entries);
  }

  clear(): void {
    this.entries.set([]);
  }
}
