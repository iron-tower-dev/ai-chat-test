import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';

import { FeedbackService } from '../../services/feedback.service';
import { MessageFeedback, POSITIVE_FEEDBACK_OPTIONS, NEGATIVE_FEEDBACK_OPTIONS } from '../../models/chat.models';

export interface FeedbackDialogData {
  messageId: string;
  messageType: 'like' | 'dislike';
  existingFeedback?: MessageFeedback;
}

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatCheckboxModule,
    MatChipsModule
  ],
  template: `
    <div class="feedback-dialog">
      <div mat-dialog-title class="dialog-header">
        <div class="header-content">
          <mat-icon [color]="data.messageType === 'like' ? 'primary' : 'warn'">
            {{ data.messageType === 'like' ? 'thumb_up' : 'thumb_down' }}
          </mat-icon>
          <h2>
            {{ data.messageType === 'like' ? 'What did you like?' : 'What could be improved?' }}
          </h2>
        </div>
      </div>

      <div mat-dialog-content class="dialog-content">
        <!-- Rating Scale -->
        <div class="rating-section">
          <label class="section-label">
            <mat-icon>star</mat-icon>
            Overall Rating ({{ rating() }}/10)
          </label>
          <mat-slider 
            min="1" 
            max="10" 
            step="1" 
            class="rating-slider">
            <input matSliderThumb [value]="rating()" (input)="onRatingChange($event)">
          </mat-slider>
          <div class="rating-labels">
            <span class="rating-label-left">Poor</span>
            <span class="rating-label-right">Excellent</span>
          </div>
        </div>

        <!-- Quick Feedback Options -->
        <div class="feedback-options-section">
          <label class="section-label">
            <mat-icon>{{ data.messageType === 'like' ? 'favorite' : 'report' }}</mat-icon>
            {{ data.messageType === 'like' ? 'What was helpful?' : 'What was the issue?' }}
          </label>
          
          <div class="feedback-chips">
            @for (option of getFeedbackOptions(); track option.id) {
              <mat-chip 
                class="feedback-chip"
                [class.selected]="selectedOptions().includes(option.id)"
                (click)="toggleOption(option.id)">
                {{ option.label }}
              </mat-chip>
            }
          </div>
        </div>

        <!-- Additional Comments -->
        <div class="comments-section">
          <mat-form-field appearance="outline" class="comments-field">
            <mat-label>Additional comments (optional)</mat-label>
            <textarea 
              matInput
              [(ngModel)]="comments"
              placeholder="Share more specific feedback..."
              rows="3"
              maxlength="500">
            </textarea>
            <mat-hint align="end">{{ comments().length }}/500</mat-hint>
          </mat-form-field>
        </div>

        <!-- Anonymous Option -->
        <div class="options-section">
          <mat-checkbox [(ngModel)]="isAnonymous">
            Submit anonymously
          </mat-checkbox>
        </div>

        <!-- Existing Feedback Notice -->
        @if (data.existingFeedback) {
          <div class="existing-feedback-notice">
            <mat-icon>info</mat-icon>
            <span>You previously rated this response. Your new feedback will update the previous one.</span>
          </div>
        }
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button 
          mat-button 
          (click)="onCancel()"
          class="cancel-button">
          Cancel
        </button>
        
        <button 
          mat-raised-button 
          color="primary"
          (click)="onSubmit()"
          [disabled]="isSubmitting()"
          class="submit-button">
          @if (isSubmitting()) {
            <ng-container>
              <mat-icon>hourglass_empty</mat-icon>
              Submitting...
            </ng-container>
          } @else {
            <ng-container>
              <mat-icon>send</mat-icon>
              {{ data.existingFeedback ? 'Update Feedback' : 'Submit Feedback' }}
            </ng-container>
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .feedback-dialog {
      min-width: 480px;
      max-width: 600px;
    }

    .dialog-header {
      padding: 24px 24px 16px 24px;
      margin: 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-content h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .dialog-content {
      padding: 0 24px 16px 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      color: var(--mat-primary);
      margin-bottom: 12px;
      font-size: 0.95rem;
    }

    /* Rating Section */
    .rating-section {
      display: flex;
      flex-direction: column;
    }

    .rating-slider {
      margin: 8px 0;
    }

    .rating-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--mat-outline);
      margin-top: 4px;
    }

    /* Feedback Options */
    .feedback-options-section {
      display: flex;
      flex-direction: column;
    }

    .feedback-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .feedback-chip {
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--mat-outline);
    }

    .feedback-chip:hover {
      background: var(--mat-primary-50);
    }

    .feedback-chip.selected {
      background: var(--mat-primary-100);
      color: var(--mat-primary);
      border-color: var(--mat-primary);
    }

    /* Comments Section */
    .comments-section {
      display: flex;
      flex-direction: column;
    }

    .comments-field {
      width: 100%;
    }

    /* Options Section */
    .options-section {
      display: flex;
      align-items: center;
    }

    /* Existing Feedback Notice */
    .existing-feedback-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: var(--mat-primary-50);
      border-radius: 6px;
      font-size: 0.9rem;
      color: var(--mat-primary);
    }

    /* Dialog Actions */
    .dialog-actions {
      padding: 16px 24px 24px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .cancel-button {
      color: var(--mat-outline);
    }

    .submit-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .submit-button[disabled] {
      opacity: 0.6;
    }

    /* Mobile Responsive */
    @media (max-width: 599px) {
      .feedback-dialog {
        min-width: 280px;
        max-width: 95vw;
      }

      .dialog-header {
        padding: 16px 16px 12px 16px;
      }

      .dialog-content {
        padding: 0 16px 12px 16px;
        gap: 20px;
      }

      .dialog-actions {
        padding: 12px 16px 16px 16px;
        flex-direction: column-reverse;
        gap: 12px;
      }

      .cancel-button,
      .submit-button {
        width: 100%;
      }

      .feedback-chips {
        gap: 6px;
      }

      .feedback-chip {
        font-size: 0.8rem;
      }

      .header-content h2 {
        font-size: 1.1rem;
      }
    }
  `]
})
export class FeedbackDialogComponent {
  private dialogRef = inject(MatDialogRef<FeedbackDialogComponent>);
  private feedbackService = inject(FeedbackService);
  
  readonly data: FeedbackDialogData = inject(MAT_DIALOG_DATA);

  // Signals
  rating = signal(this.data.existingFeedback?.rating || (this.data.messageType === 'like' ? 8 : 4));
  selectedOptions = signal<string[]>(this.getInitialOptions());
  comments = signal(this.data.existingFeedback?.freeTextComment || '');
  isAnonymous = signal(this.data.existingFeedback?.isAnonymous || false);
  isSubmitting = signal(false);

  private getInitialOptions(): string[] {
    if (!this.data.existingFeedback) return [];
    
    const existing = this.data.existingFeedback;
    const options: string[] = [];
    
    if (existing.positiveComments) {
      options.push(...existing.positiveComments);
    }
    if (existing.negativeComments) {
      options.push(...existing.negativeComments);
    }
    
    return options;
  }

  getFeedbackOptions() {
    return this.data.messageType === 'like' 
      ? POSITIVE_FEEDBACK_OPTIONS 
      : NEGATIVE_FEEDBACK_OPTIONS;
  }

  onRatingChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.rating.set(Number(target.value));
  }

  toggleOption(optionId: string): void {
    const current = this.selectedOptions();
    const index = current.indexOf(optionId);
    
    if (index >= 0) {
      // Remove option
      this.selectedOptions.set(current.filter(id => id !== optionId));
    } else {
      // Add option
      this.selectedOptions.set([...current, optionId]);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.isSubmitting.set(true);

    const feedbackData: Omit<MessageFeedback, 'id' | 'timestamp'> = {
      messageId: this.data.messageId,
      type: this.data.messageType,
      rating: this.rating(),
      positiveComments: this.data.messageType === 'like' ? this.selectedOptions() : undefined,
      negativeComments: this.data.messageType === 'dislike' ? this.selectedOptions() : undefined,
      freeTextComment: this.comments().trim() || undefined,
      isAnonymous: this.isAnonymous()
    };

    // Submit or update feedback
    const operation = this.data.existingFeedback 
      ? this.feedbackService.updateFeedback(this.data.existingFeedback.id, feedbackData)
      : this.feedbackService.submitFeedback(feedbackData);

    operation.subscribe({
      next: (feedback) => {
        this.isSubmitting.set(false);
        this.dialogRef.close(feedback);
      },
      error: (error) => {
        console.error('Feedback submission error:', error);
        this.isSubmitting.set(false);
        // TODO: Show error message
      }
    });
  }
}
