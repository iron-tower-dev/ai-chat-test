import { Component, input, inject, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MarkdownComponent } from 'ngx-markdown';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';

import { Message } from '../../models/chat.models';
import { FeedbackService } from '../../services/feedback.service';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'app-message-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    MarkdownComponent
  ],
  template: `
    <div class="message" [class]="'message-' + message().type">
      <mat-card class="message-card" [class.streaming]="isStreaming()">
        <!-- Message Content -->
        <div class="message-content-wrapper">
        @if (message().type === 'ai') {
            <markdown 
              class="message-content rendered-content markdown"
              [data]="message().content"
              katex
              #contentElement>
            </markdown>
          } @else {
            <div class="message-content plain-content">
              {{ message().content }}
            </div>
          }
        </div>

        <!-- Citations -->
        @if (message().citations && message().citations!.length > 0) {
          <div class="citations-section">
            <div class="citations-header">
              <mat-icon>article</mat-icon>
              <span>Sources</span>
            </div>
            <div class="citations-list">
              @for (citation of message().citations!; track citation.id) {
                <mat-chip 
                  class="citation-chip"
                  (click)="onCitationClick(citation)"
                  matTooltip="Click to view source details">
                  <mat-icon matChipAvatar>description</mat-icon>
                  {{ citation.documentName }}
                  @if (citation.pageNumber) {
                    <span class="page-number">(p. {{ citation.pageNumber }})</span>
                  }
                </mat-chip>
              }
            </div>
          </div>
        }

        <!-- Message Footer -->
        <div class="message-footer">
          <div class="message-meta">
            <span class="message-time">{{ message().timestamp | date:'short' }}</span>
            @if (message().tokens) {
              <span class="token-count">{{ message().tokens }} tokens</span>
            }
            @if (message().modelId) {
              <span class="model-info">{{ getModelName(message().modelId!) }}</span>
            }
          </div>

          <!-- Action Buttons -->
          @if (message().type === 'ai') {
            <div class="message-actions">
              <button 
                mat-icon-button 
                class="action-button"
                matTooltip="Copy message"
                (click)="copyMessage()">
                <mat-icon>content_copy</mat-icon>
              </button>
              
              <button 
                mat-icon-button 
                class="action-button"
                matTooltip="Like response"
                (click)="onFeedback('like')"
                [class.active]="message().feedback?.type === 'like'">
                <mat-icon>thumb_up</mat-icon>
              </button>
              
              <button 
                mat-icon-button 
                class="action-button"
                matTooltip="Dislike response"
                (click)="onFeedback('dislike')"
                [class.active]="message().feedback?.type === 'dislike'">
                <mat-icon>thumb_down</mat-icon>
              </button>
            </div>
          }
        </div>

        <!-- Streaming Indicator -->
        @if (isStreaming()) {
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .message {
      max-width: 85%;
      margin-bottom: 16px;
    }

    .message-user {
      align-self: flex-end;
    }

    .message-ai {
      align-self: flex-start;
    }

    .message-card {
      padding: 0;
      overflow: visible;
    }

    .message-user .message-card {
      background: linear-gradient(135deg, var(--mat-primary-50) 0%, var(--mat-primary-100) 100%);
      border: 1px solid var(--mat-primary-200);
    }

    .message-ai .message-card {
      background: var(--mat-surface-variant);
      border: 1px solid var(--mat-outline-variant);
    }

    .message-content-wrapper {
      padding: 16px 20px 0;
    }

    .message-content {
      word-wrap: break-word;
      line-height: 1.6;
    }

    .plain-content {
      white-space: pre-wrap;
    }

    .rendered-content {
      font-family: inherit;
    }

    /* Markdown Styles */
    .rendered-content ::ng-deep h1,
    .rendered-content ::ng-deep h2,
    .rendered-content ::ng-deep h3,
    .rendered-content ::ng-deep h4,
    .rendered-content ::ng-deep h5,
    .rendered-content ::ng-deep h6 {
      margin: 1em 0 0.5em 0;
      color: var(--mat-primary);
      font-weight: 600;
    }

    .rendered-content ::ng-deep h1 { font-size: 1.5em; }
    .rendered-content ::ng-deep h2 { font-size: 1.3em; }
    .rendered-content ::ng-deep h3 { font-size: 1.1em; }

    .rendered-content ::ng-deep p {
      margin: 0.8em 0;
    }

    .rendered-content ::ng-deep ul,
    .rendered-content ::ng-deep ol {
      padding-left: 1.5em;
      margin: 0.8em 0;
    }

    .rendered-content ::ng-deep li {
      margin: 0.3em 0;
    }

    .rendered-content ::ng-deep blockquote {
      border-left: 4px solid var(--mat-primary);
      margin: 1em 0;
      padding: 0.5em 1em;
      background: var(--mat-primary-50);
      font-style: italic;
    }

    .rendered-content ::ng-deep table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }

    .rendered-content ::ng-deep th,
    .rendered-content ::ng-deep td {
      border: 1px solid var(--mat-outline);
      padding: 8px 12px;
      text-align: left;
    }

    .rendered-content ::ng-deep th {
      background: var(--mat-primary-50);
      font-weight: 600;
    }

    /* Code Block Styles */
    .rendered-content ::ng-deep .code-block-wrapper {
      margin: 1em 0;
      border-radius: 8px;
      overflow: hidden;
      background: #1e1e1e;
      border: 1px solid var(--mat-outline);
    }

    .rendered-content ::ng-deep .code-block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: #2d2d2d;
      border-bottom: 1px solid #404040;
      color: #cccccc;
      font-size: 0.8em;
    }

    .rendered-content ::ng-deep .code-language {
      text-transform: uppercase;
      font-weight: 600;
    }

    .rendered-content ::ng-deep .copy-button {
      background: transparent;
      border: 1px solid #555;
      color: #cccccc;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8em;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .rendered-content ::ng-deep .copy-button:hover {
      background: #404040;
    }

    .rendered-content ::ng-deep .code-block {
      padding: 16px;
      margin: 0;
      background: #1e1e1e;
      color: #cccccc;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      line-height: 1.4;
    }

    .rendered-content ::ng-deep .inline-code {
      background: var(--mat-primary-50);
      color: var(--mat-primary);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
    }

    /* LaTeX Math Styles */
    .rendered-content ::ng-deep .math-block {
      margin: 1em 0;
      text-align: center;
      padding: 16px;
      background: var(--mat-primary-50);
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .rendered-content ::ng-deep .math-block:hover {
      background: var(--mat-primary-100);
    }

    .rendered-content ::ng-deep .math-inline {
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .rendered-content ::ng-deep .math-inline:hover {
      background: var(--mat-primary-50);
    }

    .rendered-content ::ng-deep .math-error {
      color: var(--mat-error);
      background: var(--mat-error-container);
      padding: 4px 8px;
      border-radius: 4px;
      font-family: monospace;
    }

    /* Citations Section */
    .citations-section {
      padding: 12px 20px 0;
      border-top: 1px solid var(--mat-outline-variant);
      margin-top: 16px;
    }

    .citations-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: var(--mat-primary);
      margin-bottom: 8px;
      font-size: 0.9em;
    }

    .citations-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .citation-chip {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .citation-chip:hover {
      background: var(--mat-primary-100);
    }

    .page-number {
      font-size: 0.8em;
      opacity: 0.7;
      margin-left: 4px;
    }

    /* Message Footer */
    .message-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 20px 16px;
      margin-top: 8px;
    }

    .message-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.75rem;
      color: var(--mat-outline);
    }

    .message-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-button {
      width: 32px;
      height: 32px;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    .action-button:hover {
      opacity: 1;
    }

    .action-button.active {
      opacity: 1;
      color: var(--mat-primary);
    }

    /* Streaming Animation */
    .streaming {
      position: relative;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 0 20px 16px;
      justify-content: flex-start;
    }

    .typing-indicator span {
      width: 6px;
      height: 6px;
      background-color: var(--mat-primary);
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Mobile Responsive */
    @media (max-width: 767px) {
      .message {
        max-width: 95%;
      }

      .message-content-wrapper {
        padding: 12px 16px 0;
      }

      .message-footer {
        padding: 8px 16px 12px;
      }

      .message-meta {
        font-size: 0.7rem;
        gap: 8px;
      }

      .action-button {
        width: 28px;
        height: 28px;
      }

      .rendered-content ::ng-deep .code-block {
        font-size: 0.8em;
        padding: 12px;
      }
    }
  `]
})
export class MessageDisplayComponent implements AfterViewInit {
  @ViewChild('contentElement', { read: ElementRef }) contentElement?: ElementRef;

  private dialog = inject(MatDialog);
  private feedbackService = inject(FeedbackService);

  // Inputs
  message = input.required<Message>();
  isStreaming = input<boolean>(false);
  



  ngAfterViewInit(): void {
    this.setupEventListeners();
  }


  private setupEventListeners(): void {
    if (!this.contentElement) return;

    const element = this.contentElement.nativeElement;

    // Add click listeners for LaTeX expressions (if ngx-markdown supports them)
    element.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('math-block') || target.classList.contains('math-inline')) {
        // Could implement LaTeX source copying here if needed
        console.log('Math element clicked:', target);
      }
    });
  }

  onCitationClick(citation: any): void {
    // TODO: Implement citation detail modal
    console.log('Citation clicked:', citation);
  }

  onFeedback(type: 'like' | 'dislike'): void {
    const message = this.message();
    
    this.dialog.open(FeedbackDialogComponent, {
      data: {
        messageId: message.id,
        messageType: type,
        existingFeedback: message.feedback
      },
      width: '500px',
      maxWidth: '90vw'
    }).afterClosed().subscribe(feedback => {
      if (feedback) {
        // Feedback was submitted successfully
        console.log('Feedback submitted:', feedback);
        // TODO: Update message feedback in the chat service
      }
    });
  }

  copyMessage(): void {
    const content = this.message().content;
    navigator.clipboard.writeText(content).then(() => {
      console.log('Message copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy message:', err);
    });
  }

  getModelName(modelId: string): string {
    // TODO: Get model name from ModelService
    return modelId;
  }
}
