import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModelService } from './services/model.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('AI Chatbot');

  constructor(private modelService: ModelService) {}

  ngOnInit(): void {
    // Initialize selected model from localStorage
    this.modelService.initializeSelectedModel();
  }
}
