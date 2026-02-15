import { Route } from '@angular/router';
import { LiveShellComponent } from '@quiztime/shell';
import { PlayJoinPage } from './play-join.page';
import { PlaySessionPage } from './play-session.page';

export const playFeatureRoutes: Route[] = [
  {
    path: 'play',
    component: LiveShellComponent,
    children: [
      {
        path: 'join',
        component: PlayJoinPage,
      },
      {
        path: 'session/:sessionId',
        component: PlaySessionPage,
      },
    ],
  },
];
