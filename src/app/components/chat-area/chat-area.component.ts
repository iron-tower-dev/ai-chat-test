import { Component, input, output, inject, signal, computed, effect, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

import { Conversation } from '../../models/chat.models';
import { ChatService } from '../../services/chat.service';
import { UiStateService } from '../../services/ui-state.service';
import { LayoutService } from '../../services/layout';
import { ScrollService } from '../../services/scroll.service';
import { MessageDisplayComponent } from '../message-display/message-display.component';
import { MessageInputTrayComponent } from '../message-input-tray/message-input-tray';

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
    MessageDisplayComponent,
    MessageInputTrayComponent
  ],
  animations: [
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="chat-area">
      @if (conversation()) {
        <!-- Messages Container -->
        <div class="messages-container" 
             #messagesContainer
             (scroll)="onScroll()"
             [style.height]="messagesContainerHeight()">
          @for (message of conversation()!.messages; track message.id; let i = $index) {
            <div class="message-wrapper" 
                 [class]="'message-wrapper-' + message.type"
                 [@messageAnimation]="'in'"
                 [style.animation-delay.ms]="i * 100">
              <app-message-display 
                [message]="message"
                [isStreaming]="false">
              </app-message-display>
            </div>
          }
          
          @if (isStreaming()) {
            <div class="message-wrapper message-wrapper-ai" [@messageAnimation]="'in'">
              <app-message-display 
                [message]="getStreamingMessage()"
                [isStreaming]="true">
              </app-message-display>
            </div>
          }
          <div class="scroll-anchor" #scrollAnchor></div>
        </div>

        <!-- Message Input -->
        <div class="input-section input-section-bottom" 
             #inputSection
             [style.left]="inputLeftOffset()">
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
          
          <!-- Message Input Tray -->
          <app-message-input-tray
            (attachDocument)="attachDocument.emit()">
          </app-message-input-tray>
        </div>
      } @else {
        <!-- Empty State with Message Input -->
        <div class="empty-state-container">
          <div class="welcome-content">
            <h2>Welcome to AI Chatbot</h2>
            <p>Type a message below to start a new conversation</p>
          </div>
          
          <!-- Message Input for New Conversation -->
          <div class="input-section input-section-center">
            <div class="input-container">
              <mat-form-field appearance="outline" class="message-input">
                <mat-label>Type your message to start...</mat-label>
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
            
            <!-- Message Input Tray -->
            <app-message-input-tray
              (attachDocument)="attachDocument.emit()">
            </app-message-input-tray>
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
      overflow-y: auto;
      padding: 16px;
      padding-bottom: 24px; /* Extra space at bottom to ensure last message is fully visible */
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: linear-gradient(135deg, 
        rgba(99, 102, 241, 0.02) 0%, 
        rgba(139, 92, 246, 0.02) 50%, 
        rgba(59, 130, 246, 0.02) 100%);
      scroll-behavior: smooth;
    }

    .message-wrapper {
      display: flex;
      width: 100%;
    }

    .message-wrapper-user {
      justify-content: flex-end;
    }

    .message-wrapper-ai {
      justify-content: flex-start;
    }

    .scroll-anchor {
      height: 1px;
      opacity: 0;
    }

    .input-section {
      border-top: 1px solid var(--mat-divider-color);
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(248, 250, 252, 0.95) 100%);
      backdrop-filter: blur(10px);
      box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
      z-index: 100;
    }

    /* Fixed positioning for bottom input */
    .input-section-bottom {
      position: fixed;
      bottom: 0;
      right: 0;
      transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    /* Static positioning for center input */
    .input-section-center {
      position: static;
    }

    .input-container {
      padding: 16px;
    }

    .message-input {
      width: 100%;
    }

    .empty-state-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: center;
      align-items: center;
      padding: 32px;
    }

    .welcome-content {
      text-align: center;
      max-width: 600px;
      margin-bottom: 32px;
      padding: 24px;
      background: linear-gradient(135deg, 
        rgba(99, 102, 241, 0.05) 0%, 
        rgba(139, 92, 246, 0.05) 100%);
      border-radius: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(99, 102, 241, 0.1);
    }

    .welcome-content h2 {
      margin-bottom: 16px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-size: 2rem;
      font-weight: 600;
    }

    .welcome-content p {
      margin-bottom: 0;
      color: var(--mat-on-surface-variant);
      font-size: 1.1rem;
      line-height: 1.5;
      opacity: 0.8;
    }

    .empty-state-container .input-section {
      width: 100%;
      max-width: 600px;
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 16px;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.9) 0%, 
        rgba(248, 250, 252, 0.9) 100%);
      backdrop-filter: blur(15px);
      box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15), 
                  0 2px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .empty-state-container .input-section:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 48px rgba(99, 102, 241, 0.2), 
                  0 4px 16px rgba(0, 0, 0, 0.08);
      border-color: rgba(99, 102, 241, 0.3);
    }

    .empty-state-container .input-container {
      padding: 20px;
    }

    /* Mobile adjustments */
    @media (max-width: 767px) {
      .messages-container {
        padding: 12px;
      }

      .input-container {
        padding: 12px;
      }

      .empty-state-container {
        padding: 20px;
        justify-content: flex-start;
        padding-top: 10vh;
      }

      .welcome-content h2 {
        font-size: 1.5rem;
      }

      .welcome-content p {
        font-size: 1rem;
      }

      .empty-state-container .input-container {
        padding: 16px;
      }
    }
  `]
})
export class ChatAreaComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
  private chatService = inject(ChatService);
  private router = inject(Router);
  private uiState = inject(UiStateService);
  private layout = inject(LayoutService);
  private scrollService = inject(ScrollService);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef<HTMLDivElement>;
  @ViewChild('inputSection') inputSection?: ElementRef<HTMLDivElement>;
  
  private heightRecalcTrigger = signal(0); // Signal to trigger height recalculation

  // Get conversation from service directly instead of input
  conversation = this.chatService.currentConversation;

  // Outputs
  messageChange = output<void>();
  attachDocument = output<void>();

  // Signals
  messageText = signal('');
  isStreaming = this.chatService.isStreaming;
  streamingMessage = this.chatService.streamingMessage;

  // Effect to automatically scroll when streaming content changes
  streamingScrollEffect = effect(() => {
    const streaming = this.isStreaming();
    const content = this.streamingMessage();
    
    if (streaming && content && this.messagesContainer) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        this.scrollService.autoScrollToBottom(this.messagesContainer);
      }, 10);
    }
  });

  // Computed properties for input positioning and height
  inputLeftOffset = computed(() => {
    const opened = this.uiState.sidenavOpened();
    const mode = this.layout.sidenavMode();
    const isMobile = this.layout.isMobile();
    
    // Only apply offset if sidenav is open and in 'side' mode (not overlay)
    // Mobile devices use 'over' mode, so no offset needed
    if (opened && mode === 'side' && !isMobile) {
      return this.layout.getSidebarWidth() + 'px';
    }
    return '0px';
  });

  // Calculate messages container height to fill space above input
  messagesContainerHeight = computed(() => {
    const conversation = this.conversation();
    // React to height recalculation trigger
    this.heightRecalcTrigger();
    
    if (conversation) {
      // Use dynamic calculation if available, otherwise fallback to CSS calc
      const dynamicHeight = this.calculateDynamicHeight();
      if (dynamicHeight) {
        return dynamicHeight + 'px';
      }
      // Fallback: Toolbar (64px) + Input section (170px with generous padding)
      return 'calc(100vh - 64px - 170px)';
    }
    // In empty state, container should be flexible
    return 'auto';
  });

  private calculateDynamicHeight(): number | null {
    if (this.inputSection && this.conversation()) {
      const inputHeight = this.inputSection.nativeElement.offsetHeight;
      const toolbarHeight = 64;
      const safetyMargin = 16; // Extra margin for safety
      
      return window.innerHeight - toolbarHeight - inputHeight - safetyMargin;
    }
    return null;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // Recalculate height when window is resized
    this.heightRecalcTrigger.update(val => val + 1);
  }

  onScroll(): void {
    if (this.messagesContainer) {
      this.scrollService.handleScroll(this.messagesContainer);
    }
  }


  ngOnDestroy(): void {
    // Reset scroll state when component is destroyed
    this.scrollService.resetScrollState();
  }

  onSendMessage(event?: KeyboardEvent): void {
    if (event && !event.shiftKey) {
      event.preventDefault();
    } else if (event && event.shiftKey) {
      return; // Allow new line with Shift+Enter
    }

    const text = this.messageText().trim();
    const currentConversation = this.conversation();

    if (!text || this.isStreaming()) {
      return;
    }

    this.messageText.set('');

    if (currentConversation) {
      // Existing conversation - send message
      this.chatService.sendMessage(currentConversation.id, text).subscribe({
        next: (streamingResponse) => {
          // Streaming is handled by the service signals and effects
        },
        error: (error) => {
          console.error('Error sending message:', error);
        },
        complete: () => {
          if (this.messagesContainer) {
            this.scrollService.forceScrollToBottom(this.messagesContainer);
          }
          this.messageChange.emit();
        }
      });
    } else {
      // No conversation - create new one and send message
// No conversation - create new one and send message
this.chatService.createConversation().subscribe({
  next: (conversation) => {
    this.router.navigate(['/chat', conversation.id]).then(() => {
      this.chatService.sendMessage(conversation.id, text).subscribe({
        next: () => {},
        error: (error) => {
          console.error('Error sending message:', error);
        },
        complete: () => {
          if (this.messagesContainer) {
            this.scrollService.forceScrollToBottom(this.messagesContainer);
          }
          this.messageChange.emit();
        }
      });
    }).catch(err => console.error('Navigation failed:', err));
  },
        error: (error) => {
          console.error('Error creating conversation:', error);
        }
      });
    }
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

  ngAfterViewInit(): void {
    // Scroll to bottom when component initializes with existing conversation
    if (this.conversation()?.messages.length && this.messagesContainer) {
      this.scrollService.forceScrollToBottom(this.messagesContainer);
    }
    
    // Trigger height recalculation once input section is rendered
    setTimeout(() => {
      this.heightRecalcTrigger.update(val => val + 1);
    }, 100);
  }

  ngAfterViewChecked(): void {
    // Let the scroll service handle auto-scrolling based on its state
    if (this.messagesContainer) {
      this.scrollService.autoScrollToBottom(this.messagesContainer);
    }
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
