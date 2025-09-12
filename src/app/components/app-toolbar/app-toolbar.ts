import { Component, input, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './app-toolbar.html',
  styleUrls: ['./app-toolbar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppToolbarComponent {
  readonly isSidenavOpen = input<boolean>(false);
  readonly toggleSidenav = output<void>();
}
export class AppToolbarComponent {
  isSidenavOpen = input<boolean>(false);
  toggleSidenav = output<void>();
}
