import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-history-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="sidebar-container">
      <div class="sidebar-header">
        <button mat-raised-button color="primary" (click)="onNewConversation()" class="new-chat-btn">
          <mat-icon>add</mat-icon>
          New Chat
        </button>
      </div>

      <div class="search-container">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search conversations...</mat-label>
          <input matInput [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" (input)="onSearch($event)">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </div>

      <div class="conversations-list">
        <div class="conversation-items-container">
          @for (conversation of filteredConversations(); track conversation.id) {
            <div class="conversation-item" (click)="onConversationSelect(conversation.id)">
              <div class="conversation-content">
                <div class="conversation-title">{{ conversation.title }}</div>
                <div class="conversation-preview">
                  @if (conversation.messages.length > 0) {
                    {{ conversation.messages[conversation.messages.length - 1].content | slice:0:60 }}...
                  }
                </div>
                <div class="conversation-meta">
                  <span class="conversation-date">{{ conversation.updatedAt | date:'MMM d, y' }}</span>
                  @if (conversation.isPinned) {
                    <mat-icon class="pin-icon">push_pin</mat-icon>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid var(--mat-divider-color);
      flex-shrink: 0;
    }

    .new-chat-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .search-container {
      padding: 16px;
      border-bottom: 1px solid var(--mat-divider-color);
      flex-shrink: 0;
    }

    .search-field {
      width: 100%;
    }

    .conversations-list {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .conversation-items-container {
      display: flex;
      flex-direction: column;
    }

    .conversation-item {
      cursor: pointer;
      border-bottom: 1px solid var(--mat-divider-color);
      padding: 16px;
      display: flex;
      min-height: 80px;
      transition: background-color 0.2s ease;
    }

    .conversation-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .conversation-item:last-child {
      border-bottom: none;
    }

    .conversation-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 48px;
    }

    .conversation-title {
      font-weight: 500;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 6px;
      color: var(--mat-list-item-leading-icon-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .conversation-preview {
      font-size: 12px;
      color: var(--mat-form-field-disabled-input-text-color);
      line-height: 1.4;
      margin-bottom: 8px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      min-height: 30px;
    }

    .conversation-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .conversation-date {
      font-size: 11px;
      color: var(--mat-form-field-disabled-input-text-color);
    }

    .pin-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--mat-warn-text);
      margin-left: 8px;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .conversation-item:hover {
        background-color: rgba(255, 255, 255, 0.08);
      }
    }

    /* Scrollbar styling */
    .conversations-list::-webkit-scrollbar {
      width: 6px;
    }

    .conversations-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .conversations-list::-webkit-scrollbar-thumb {
      background: var(--mat-form-field-disabled-input-text-color);
      border-radius: 3px;
    }

    .conversations-list::-webkit-scrollbar-thumb:hover {
      background: var(--mat-list-item-leading-icon-color);
    }
  `]
})
export class ChatHistorySidebarComponent {
  private chatService = inject(ChatService);

  // Signals
  conversations = this.chatService.conversations;
  searchQuery = signal('');
  filteredConversations = signal(this.conversations());

  // Outputs
  conversationSelected = output<string>();
  newConversation = output<void>();

  onNewConversation(): void {
    this.newConversation.emit();
  }

  onConversationSelect(conversationId: string): void {
    this.conversationSelected.emit(conversationId);
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery.set(query);
    
    if (!query.trim()) {
      this.filteredConversations.set(this.conversations());
      return;
    }

    const filtered = this.conversations().filter(conversation =>
      conversation.title.toLowerCase().includes(query) ||
      conversation.messages.some(message =>
        message.content.toLowerCase().includes(query)
      )
    );
    
    this.filteredConversations.set(filtered);
  }
}
