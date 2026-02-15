import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

export type UiMode = 'admin' | 'host' | 'play' | 'unknown';

@Injectable({ providedIn: 'root' })
export class UiModeState {
  private readonly router = inject(Router);
  private readonly currentPath = signal('/');

  readonly mode = computed<UiMode>(() => {
    const path = this.currentPath();

    if (path.startsWith('/admin')) {
      return 'admin';
    }

    if (path.startsWith('/host')) {
      return 'host';
    }

    if (path.startsWith('/play')) {
      return 'play';
    }

    return 'unknown';
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        map(() => this.router.url.split('?')[0] || '/'),
      )
      .subscribe((url) => {
        this.currentPath.set(url);
      });
  }
}
