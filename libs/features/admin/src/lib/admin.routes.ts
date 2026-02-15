import { Route } from '@angular/router';
import { authGuard } from '@quiztime/auth';
import { AdminShellComponent } from '@quiztime/shell';
import { AdminDashboardPage } from './admin-dashboard.page';
import { AdminLoginPage } from './admin-login.page';
import { AdminQuizEditorPage } from './admin-quiz-editor.page';
import { AdminQuizzesPage } from './admin-quizzes.page';

export const adminFeatureRoutes: Route[] = [
  {
    path: 'admin/login',
    component: AdminLoginPage,
  },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        component: AdminDashboardPage,
      },
      {
        path: 'quizzes',
        component: AdminQuizzesPage,
      },
      {
        path: 'quizzes/new',
        component: AdminQuizEditorPage,
      },
      {
        path: 'quizzes/:quizId/edit',
        component: AdminQuizEditorPage,
      },
    ],
  },
];
