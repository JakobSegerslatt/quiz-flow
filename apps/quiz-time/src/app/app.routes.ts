import { Route } from '@angular/router';
import { adminFeatureRoutes } from '@quiztime/admin';
import { hostFeatureRoutes } from '@quiztime/host';
import { playFeatureRoutes } from '@quiztime/play';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'play/join',
  },
  ...adminFeatureRoutes,
  ...hostFeatureRoutes,
  ...playFeatureRoutes,
  {
    path: '**',
    redirectTo: 'play/join',
  },
];
