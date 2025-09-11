import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { ChatService } from '../../services/chat.service';
import { ModelService } from '../../services/model.service';
import { ChatHistorySidebarComponent } from '../chat-history-sidebar/chat-history-sidebar.component';
import { ChatAreaComponent } from '../chat-area/chat-area.component';
import { ModelSelectorComponent } from '../model-selector/model-selector.component';
import { DocumentDialogComponent } from '../document-dialog/document-dialog.component';

@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ChatHistorySidebarComponent,
    ChatAreaComponent,
    ModelSelectorComponent
  ],
  template: `
    <div class="chat-layout">
      <!-- Mobile Toolbar -->
      @if (isMobile()) {
        <mat-toolbar class="mobile-toolbar">
          <button mat-icon-button (click)="sidenavOpened.set(!sidenavOpened())">
            <mat-icon>{{ sidenavOpened() ? 'close' : 'menu' }}</mat-icon>
          </button>
          <span class="toolbar-title">AI Chatbot</span>
          <app-model-selector></app-model-selector>
        </mat-toolbar>
      }

      <mat-sidenav-container class="sidenav-container">
        <!-- Chat History Sidebar -->
        <mat-sidenav 
          #sidenav
          [mode]="sidenavMode()" 
          [opened]="sidenavOpened()"
          [fixedInViewport]="isMobile()"
          class="chat-sidebar"
          (openedChange)="sidenavOpened.set($event)">
          <app-chat-history-sidebar 
            (conversationSelected)="onConversationSelected($event)"
            (newConversation)="onNewConversation()">
          </app-chat-history-sidebar>
        </mat-sidenav>

        <!-- Main Chat Area -->
        <mat-sidenav-content class="chat-content">
          <!-- Desktop Toolbar -->
          @if (!isMobile()) {
            <mat-toolbar class="desktop-toolbar">
              <div class="toolbar-left">
                <button mat-icon-button (click)="sidenavOpened.set(!sidenavOpened())">
                  <mat-icon>{{ sidenavOpened() ? 'menu_open' : 'menu' }}</mat-icon>
                </button>
                <span class="toolbar-title">
                  @if (currentConversation()) {
                    {{ currentConversation()!.title }}
                  } @else {
                    AI Chatbot
                  }
                </span>
              </div>
              <div class="toolbar-right">
                <app-model-selector></app-model-selector>
              </div>
            </mat-toolbar>
          }

          <!-- Chat Area -->
          <div class="chat-area-container">
            <app-chat-area
              [conversation]="currentConversation()"
              (messageChange)="onConversationUpdate()">
            </app-chat-area>

            <!-- Document Upload FAB -->
            @if (currentConversation()) {
              <button 
                mat-fab 
                color="accent"
                class="document-fab"
                matTooltip="Upload Documents for RAG"
                (click)="openDocumentDialog()">
                <mat-icon>attach_file</mat-icon>
              </button>
            }
          </div>
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

    .mobile-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--mat-toolbar-container-background-color);
      z-index: 1000;
    }

    .sidenav-container {
      flex: 1;
      background-color: var(--mat-app-background-color);
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

    .desktop-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--mat-toolbar-container-background-color);
      border-bottom: 1px solid var(--mat-divider-color);
      z-index: 10;
    }

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toolbar-title {
      font-weight: 500;
      font-size: 1.125rem;
    }

    .chat-area-container {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    .document-fab {
      position: absolute;
      bottom: 24px;
      right: 24px;
      z-index: 10;
    }

    /* Mobile adjustments */
    @media (max-width: 767px) {
      .chat-sidebar {
        width: 280px;
      }
      
      .toolbar-title {
        font-size: 1rem;
      }
    }

    /* Responsive breakpoints */
    @media (max-width: 599px) {
      .mobile-toolbar {
        padding: 0 8px;
      }
      
      .toolbar-title {
        font-size: 0.875rem;
      }
    }
  `]
})
export class ChatLayoutComponent implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private chatService = inject(ChatService);
  private modelService = inject(ModelService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  // Reactive state
  sidenavOpened = signal(true);
  currentConversation = this.chatService.currentConversation;

  // Computed properties
  isMobile = computed(() => {
    return this.breakpointObserver.isMatched(['(max-width: 767px)']);
  });

  sidenavMode = computed(() => {
    return this.isMobile() ? 'over' : 'side';
  });

  ngOnInit(): void {
    // Handle mobile view
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
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

    // Listen for breakpoint changes
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe(result => {
        if (result.matches && this.sidenavOpened()) {
          this.sidenavOpened.set(false);
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
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
    this.router.navigate(['/chat', conversationId]);
  }

  onNewConversation(): void {
    this.chatService.createConversation().subscribe({
      next: (conversation) => {
        if (this.isMobile()) {
          this.sidenavOpened.set(false);
        }
        this.router.navigate(['/chat', conversation.id]);
      },
      error: (error) => {
        console.error('Error creating conversation:', error);
      }
    });
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
