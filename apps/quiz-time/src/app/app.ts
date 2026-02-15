import { Component, inject } from '@angular/core';
import { UiModeState } from '@quiztime/state';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly _uiModeState = inject(UiModeState);
}
