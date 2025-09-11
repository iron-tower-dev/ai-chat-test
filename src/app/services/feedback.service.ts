import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { MessageFeedback, POSITIVE_FEEDBACK_OPTIONS, NEGATIVE_FEEDBACK_OPTIONS } from '../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  // Signal for reactive state management
  feedbackHistory = signal<MessageFeedback[]>([]);

  constructor() {
    this.initializeMockFeedback();
  }

  private initializeMockFeedback(): void {
    // Initialize with some mock feedback data
    const mockFeedback: MessageFeedback[] = [
      {
        id: 'feedback-1',
        messageId: 'msg-1-2',
        type: 'like',
        rating: 9,
        positiveComments: ['helpful', 'accurate'],
        freeTextComment: 'Very comprehensive explanation of Angular signals!',
        isAnonymous: false,
        timestamp: new Date('2024-01-15T10:30:00')
      },
      {
        id: 'feedback-2',
        messageId: 'msg-2-2',
        type: 'like',
        rating: 8,
        positiveComments: ['well-formatted', 'complete'],
        isAnonymous: true,
        timestamp: new Date('2024-01-14T15:45:00')
      }
    ];

    this.feedbackHistory.set(mockFeedback);
  }

  // Submit feedback for a message
  submitFeedback(feedback: Omit<MessageFeedback, 'id' | 'timestamp'>): Observable<MessageFeedback> {
    const newFeedback: MessageFeedback = {
      ...feedback,
      id: `feedback-${Date.now()}`,
      timestamp: new Date()
    };

    // Add to feedback history
    const updatedHistory = [...this.feedbackHistory(), newFeedback];
    this.feedbackHistory.set(updatedHistory);

    return of(newFeedback).pipe(delay(200));
  }

  // Update existing feedback (within editing window)
  updateFeedback(feedbackId: string, updates: Partial<MessageFeedback>): Observable<MessageFeedback> {
    const feedbackList = this.feedbackHistory();
    const feedbackIndex = feedbackList.findIndex(f => f.id === feedbackId);
    
    if (feedbackIndex === -1) {
      throw new Error('Feedback not found');
    }

    const existingFeedback = feedbackList[feedbackIndex];
    
    // Check if feedback is still editable (within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (existingFeedback.timestamp < fiveMinutesAgo) {
      throw new Error('Feedback editing window has expired');
    }

    const updatedFeedback = { ...existingFeedback, ...updates };
    const updatedHistory = [...feedbackList];
    updatedHistory[feedbackIndex] = updatedFeedback;
    
    this.feedbackHistory.set(updatedHistory);

    return of(updatedFeedback).pipe(delay(100));
  }

  // Get feedback for a specific message
  getFeedbackForMessage(messageId: string): Observable<MessageFeedback | null> {
    const feedback = this.feedbackHistory().find(f => f.messageId === messageId) || null;
    return of(feedback).pipe(delay(50));
  }

  // Get all feedback history for user
  getFeedbackHistory(): Observable<MessageFeedback[]> {
    return of(this.feedbackHistory()).pipe(delay(100));
  }

  // Get feedback statistics
  getFeedbackStats(): Observable<{
    totalFeedback: number;
    positiveCount: number;
    negativeCount: number;
    averageRating: number;
  }> {
    const feedback = this.feedbackHistory();
    const totalFeedback = feedback.length;
    const positiveCount = feedback.filter(f => f.type === 'like').length;
    const negativeCount = feedback.filter(f => f.type === 'dislike').length;
    
    const ratingsWithValues = feedback.filter(f => f.rating !== undefined);
    const averageRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, f) => sum + (f.rating || 0), 0) / ratingsWithValues.length
      : 0;

    const stats = {
      totalFeedback,
      positiveCount,
      negativeCount,
      averageRating: Math.round(averageRating * 10) / 10
    };

    return of(stats).pipe(delay(100));
  }

  // Delete feedback
  deleteFeedback(feedbackId: string): Observable<boolean> {
    const updatedHistory = this.feedbackHistory().filter(f => f.id !== feedbackId);
    this.feedbackHistory.set(updatedHistory);
    return of(true).pipe(delay(50));
  }

  // Get predefined feedback options
  getPositiveFeedbackOptions() {
    return POSITIVE_FEEDBACK_OPTIONS;
  }

  getNegativeFeedbackOptions() {
    return NEGATIVE_FEEDBACK_OPTIONS;
  }

  // Check if feedback can still be edited
  canEditFeedback(feedback: MessageFeedback): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return feedback.timestamp > fiveMinutesAgo;
  }

  // Export feedback data
  exportFeedbackData(): Observable<Blob> {
    const feedback = this.feedbackHistory();
    const jsonData = JSON.stringify(feedback, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    return of(blob).pipe(delay(100));
  }
}
