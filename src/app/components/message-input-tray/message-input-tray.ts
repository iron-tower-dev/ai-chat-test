import { Component, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-message-input-tray',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './message-input-tray.html',
  styleUrl: './message-input-tray.scss'
})
export class MessageInputTrayComponent {
  attachDocument = output<void>();
}
