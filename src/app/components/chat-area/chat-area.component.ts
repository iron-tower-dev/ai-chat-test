import { Component, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';

import { Conversation } from '../../models/chat.models';
import { ChatService } from '../../services/chat.service';
import { MessageDisplayComponent } from '../message-display/message-display.component';

@Component({
  selector: 'app-chat-area',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TextFieldModule,
    MessageDisplayComponent
  ],
  template: `
    <div class="chat-area">
      @if (conversation()) {
        <!-- Messages Container -->
        <div class="messages-container">
          @for (message of conversation()!.messages; track message.id) {
            <app-message-display 
              [message]="message"
              [isStreaming]="false">
            </app-message-display>
          }
          
          @if (isStreaming()) {
            <app-message-display 
              [message]="getStreamingMessage()"
              [isStreaming]="true">
            </app-message-display>
          }
        </div>

        <!-- Message Input -->
        <div class="input-container">
          <mat-form-field appearance="outline" class="message-input">
            <mat-label>Type your message...</mat-label>
            <textarea 
              matInput 
              [ngModel]="messageText()"
              (ngModelChange)="messageText.set($event)"
              (keydown.enter)="onSendMessage($any($event))"
              [disabled]="isStreaming()"
              rows="1"
              cdkTextareaAutosize
              cdkAutosizeMinRows="1"
              cdkAutosizeMaxRows="6">
            </textarea>
            <button 
              mat-icon-button 
              matSuffix 
              (click)="onSendMessage()"
              [disabled]="!messageText().trim() || isStreaming()">
              <mat-icon>send</mat-icon>
            </button>
          </mat-form-field>
        </div>
      } @else {
        <!-- Welcome Screen -->
        <div class="welcome-container">
          <div class="welcome-content">
            <h2>Welcome to AI Chatbot</h2>
            <p>Start a new conversation to begin chatting with AI models.</p>
            <button mat-raised-button color="primary" (click)="onCreateNewConversation()">
              <mat-icon>add</mat-icon>
              Start New Conversation
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .chat-area {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }

    .input-container {
      padding: 16px;
      border-top: 1px solid var(--mat-divider-color);
      background: var(--mat-app-background-color);
    }

    .message-input {
      width: 100%;
    }

    .welcome-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 32px;
    }

    .welcome-content {
      text-align: center;
      max-width: 400px;
    }

    .welcome-content h2 {
      margin-bottom: 16px;
      color: var(--mat-primary);
    }

    .welcome-content p {
      margin-bottom: 24px;
      color: var(--mat-form-field-disabled-input-text-color);
    }

    /* Mobile adjustments */
    @media (max-width: 767px) {
      .messages-container {
        padding: 12px;
      }

      .input-container {
        padding: 12px;
      }
    }
  `]
})
export class ChatAreaComponent {
  private chatService = inject(ChatService);

  // Inputs
  conversation = input<Conversation | null>(null);

  // Outputs
  messageChange = output<void>();

  // Signals
  messageText = signal('');
  isStreaming = this.chatService.isStreaming;
  streamingMessage = this.chatService.streamingMessage;

  onSendMessage(event?: KeyboardEvent): void {
    if (event && !event.shiftKey) {
      event.preventDefault();
    } else if (event && event.shiftKey) {
      return; // Allow new line with Shift+Enter
    }

    const text = this.messageText().trim();
    const currentConversation = this.conversation();

    if (!text || !currentConversation || this.isStreaming()) {
      return;
    }

    this.messageText.set('');

    // Send message and handle streaming response
    this.chatService.sendMessage(currentConversation.id, text).subscribe({
      next: (streamingResponse) => {
        // Streaming is handled by the service signals
      },
      error: (error) => {
        console.error('Error sending message:', error);
      },
      complete: () => {
        this.messageChange.emit();
      }
    });
  }

  onCreateNewConversation(): void {
    this.chatService.createConversation().subscribe({
      next: (conversation) => {
        this.messageChange.emit();
      },
      error: (error) => {
        console.error('Error creating conversation:', error);
      }
    });
  }

  getStreamingMessage(): any {
    // Create a temporary message object for streaming display
    return {
      id: 'streaming-message',
      conversationId: this.conversation()?.id || '',
      content: this.streamingMessage(),
      type: 'ai',
      timestamp: new Date(),
      status: 'sending'
    };
  }
}
