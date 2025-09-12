import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';

import { ChatService } from '../../services/chat.service';
import { ModelService } from '../../services/model.service';
import { UiStateService } from '../../services/ui-state.service';
import { LayoutService } from '../../services/layout';
import { AppToolbarComponent } from '../app-toolbar/app-toolbar';
import { ChatHistorySidebarComponent } from '../chat-history-sidebar/chat-history-sidebar.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { DocumentDialogComponent } from '../document-dialog/document-dialog.component';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    AppToolbarComponent,
    ChatHistorySidebarComponent,
    ChatAreaComponent
  ],
  template: `
    <div class="chat-layout">
      <!-- App Toolbar -->
      <app-toolbar 
        [isSidenavOpen]="uiState.sidenavOpened()"
        (toggleSidenav)="uiState.toggleSidenav()">
      </app-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <!-- Chat History Sidebar -->
        <mat-sidenav 
          #sidenav
          [mode]="layout.sidenavMode()" 
          [opened]="uiState.sidenavOpened()"
          [fixedInViewport]="layout.isMobile()"
          class="chat-sidebar"
          (openedChange)="uiState.setSidenavOpened($event)">
          <app-chat-history-sidebar 
            (conversationSelected)="onConversationSelected($event)"
            (newConversation)="onNewConversation()">
          </app-chat-history-sidebar>
        </mat-sidenav>

        <!-- Main Chat Area -->
        <mat-sidenav-content class="chat-content">
          @if (currentConversation()) {
            <!-- Chat Area with Conversation -->
            <app-chat-area
              (messageChange)="onConversationUpdate()"
              (attachDocument)="openDocumentDialog()">
            </app-chat-area>
          } @else {
            <!-- Empty State with Centered Input -->
            <div class="empty-state">
              <app-chat-area
                (messageChange)="onConversationUpdate()"
                (attachDocument)="openDocumentDialog()">
              </app-chat-area>
            </div>
          }
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .chat-layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .sidenav-container {
      flex: 1;
      background-color: var(--mat-app-background-color);
      margin-top: 64px; /* Account for fixed toolbar */
    }

    .chat-sidebar {
      width: 320px;
      background: var(--mat-sidenav-container-background-color);
      border-right: 1px solid var(--mat-divider-color);
      height: 100%;
      overflow: hidden;
    }

    .chat-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .empty-state {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-state app-chat-area {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Mobile adjustments */
    @media (max-width: 767px) {
      .chat-sidebar {
        width: 280px;
      }
      
      .empty-state {
        align-items: flex-start;
        padding-top: 20vh;
      }
    }
  `]
})
export class ChatLayoutComponent implements OnInit {
  private chatService = inject(ChatService);
  private modelService = inject(ModelService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  
  // Services
  protected uiState = inject(UiStateService);
  protected layout = inject(LayoutService);

  // Reactive state
  currentConversation = this.chatService.currentConversation;

  ngOnInit(): void {
    // Handle mobile view
    if (this.layout.isMobile()) {
      this.uiState.setSidenavOpened(false);
    }

    // Load conversation from route parameter
    this.route.params.subscribe(params => {
      const conversationId = params['id'];
      if (conversationId) {
        this.loadConversation(conversationId);
      } else {
        // No specific conversation, clear current
        this.chatService.setCurrentConversation(null);
      }
    });
  }

  private loadConversation(id: string): void {
    this.chatService.getConversation(id).subscribe({
      next: (conversation) => {
        if (conversation) {
          this.chatService.setCurrentConversation(conversation);
        } else {
          // Conversation not found, redirect to chat home
          this.router.navigate(['/chat']);
        }
      },
      error: (error) => {
        console.error('Error loading conversation:', error);
        this.router.navigate(['/chat']);
      }
    });
  }

  onConversationSelected(conversationId: string): void {
    if (this.layout.isMobile()) {
      this.uiState.setSidenavOpened(false);
    }
    this.router.navigate(['/chat', conversationId]);
  }

  onNewConversation(): void {
    // Navigate to empty state instead of creating conversation immediately
    if (this.layout.isMobile()) {
      this.uiState.setSidenavOpened(false);
    }
    this.router.navigate(['/chat']);
  }

  onConversationUpdate(): void {
    // Refresh current conversation data
    const current = this.currentConversation();
    if (current) {
      this.loadConversation(current.id);
    }
  }

  openDocumentDialog(): void {
    this.dialog.open(DocumentDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh'
    });
  }
}
