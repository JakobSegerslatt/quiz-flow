import { Route } from '@angular/router';
import { authGuard } from '@quiztime/auth';
import { AdminShellComponent } from '@quiztime/shell';
import { HostLivePage } from './host-live.page';
import { HostLobbyPage } from './host-lobby.page';
import { HostNewSessionPage } from './host-new-session.page';

export const hostFeatureRoutes: Route[] = [
  {
    path: 'host',
    component: AdminShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'session/new',
        component: HostNewSessionPage,
      },
      {
        path: 'session/:sessionId/lobby',
        component: HostLobbyPage,
      },
      {
        path: 'session/:sessionId/live',
        component: HostLivePage,
      },
    ],
  },
];
