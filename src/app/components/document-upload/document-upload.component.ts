import { Component, inject, signal, output, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/chat.models';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="document-upload">
      <!-- Upload Area -->
      <div 
        class="upload-area"
        [class.dragover]="isDragOver()"
        [class.disabled]="isUploading()"
        (click)="triggerFileInput()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)">
        
        <input 
          #fileInput
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md"
          (change)="onFileSelected($event)"
          style="display: none;">
        
        <div class="upload-content">
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <h3>Upload Documents</h3>
          <p>Drag and drop files here or click to browse</p>
          <div class="supported-formats">
            <small>Supported: PDF, DOC, DOCX, TXT, MD (max 10MB each)</small>
          </div>
        </div>
      </div>

      <!-- Uploaded Documents List -->
      @if (documents().length > 0) {
        <div class="documents-section">
          <h4>
            <mat-icon>folder_open</mat-icon>
            Uploaded Documents ({{ documents().length }})
          </h4>
          
          <div class="documents-list">
            @for (doc of documents(); track doc.id) {
              <mat-card class="document-card">
                <div class="document-header">
                  <div class="document-info">
                    <mat-icon class="doc-icon">{{ getDocumentIcon(doc.type) }}</mat-icon>
                    <div class="doc-details">
                      <span class="doc-name">{{ doc.name }}</span>
                      <span class="doc-meta">
                        {{ formatFileSize(doc.size) }} • {{ doc.uploadDate | date:'MMM d, y' }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="document-actions">
                    <button 
                      mat-icon-button
                      matTooltip="Remove document"
                      (click)="removeDocument(doc.id)"
                      [disabled]="doc.status === 'uploading'">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                </div>

                <!-- Status and Progress -->
                <div class="document-status">
                  @switch (doc.status) {
                    @case ('uploading') {
                      <div class="status-row">
                        <span class="status-text">
                          <mat-icon class="status-icon">cloud_upload</mat-icon>
                          Uploading...
                        </span>
                        <span class="progress-text">{{ getUploadProgress(doc.id) }}%</span>
                      </div>
                      <mat-progress-bar 
                        mode="determinate" 
                        [value]="getUploadProgress(doc.id)">
                      </mat-progress-bar>
                    }
                    @case ('processing') {
                      <div class="status-row">
                        <span class="status-text">
                          <mat-icon class="status-icon processing">settings</mat-icon>
                          Processing...
                        </span>
                      </div>
                      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                    }
                    @case ('ready') {
                      <div class="status-row">
                        <span class="status-text ready">
                          <mat-icon class="status-icon">check_circle</mat-icon>
                          Ready for RAG
                        </span>
                        <mat-chip class="ready-chip">
                          <mat-icon matChipAvatar>psychology</mat-icon>
                          AI Ready
                        </mat-chip>
                      </div>
                    }
                    @case ('error') {
                      <div class="status-row">
                        <span class="status-text error">
                          <mat-icon class="status-icon">error</mat-icon>
                          Processing failed
                        </span>
                        <button mat-stroked-button color="primary" size="small">
                          Retry
                        </button>
                      </div>
                    }
                  }
                </div>
              </mat-card>
            }
          </div>
        </div>
      }

      <!-- Upload Statistics -->
      @if (documents().length > 0) {
        <div class="upload-stats">
          <div class="stats-item">
            <mat-icon>description</mat-icon>
            <span>{{ documents().length }} document{{ documents().length !== 1 ? 's' : '' }}</span>
          </div>
          <div class="stats-item">
            <mat-icon>storage</mat-icon>
            <span>{{ getTotalSize() }}</span>
          </div>
          <div class="stats-item">
            <mat-icon>check_circle</mat-icon>
            <span>{{ getReadyCount() }} ready</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .document-upload {
      width: 100%;
    }

    .upload-area {
      border: 2px dashed var(--mat-outline);
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: var(--mat-surface);
    }

    .upload-area:hover:not(.disabled) {
      border-color: var(--mat-primary);
      background: var(--mat-primary-50);
    }

    .upload-area.dragover {
      border-color: var(--mat-primary);
      background: var(--mat-primary-100);
      transform: scale(1.02);
    }

    .upload-area.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--mat-primary);
      margin-bottom: 8px;
    }

    .upload-area h3 {
      margin: 0;
      color: var(--mat-on-surface);
      font-weight: 500;
    }

    .upload-area p {
      margin: 0;
      color: var(--mat-outline);
      font-size: 14px;
    }

    .supported-formats {
      margin-top: 8px;
    }

    .supported-formats small {
      color: var(--mat-outline);
      font-size: 12px;
    }

    /* Documents Section */
    .documents-section {
      margin-top: 24px;
    }

    .documents-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      color: var(--mat-primary);
      font-weight: 500;
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .document-card {
      padding: 16px;
    }

    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .document-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .doc-icon {
      color: var(--mat-primary);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .doc-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .doc-name {
      font-weight: 500;
      color: var(--mat-on-surface);
    }

    .doc-meta {
      font-size: 12px;
      color: var(--mat-outline);
    }

    .document-actions {
      display: flex;
      gap: 4px;
    }

    /* Status Styles */
    .document-status {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-text {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
    }

    .status-text.ready {
      color: var(--mat-primary);
    }

    .status-text.error {
      color: var(--mat-error);
    }

    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .status-icon.processing {
      animation: rotate 2s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .progress-text {
      font-size: 12px;
      color: var(--mat-outline);
      font-weight: 500;
    }

    .ready-chip {
      font-size: 11px;
      min-height: 24px;
    }

    /* Upload Statistics */
    .upload-stats {
      display: flex;
      gap: 24px;
      margin-top: 16px;
      padding: 16px;
      background: var(--mat-surface-variant);
      border-radius: 8px;
    }

    .stats-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--mat-on-surface-variant);
    }

    .stats-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Mobile Responsive */
    @media (max-width: 767px) {
      .upload-area {
        padding: 24px 16px;
      }

      .upload-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      .document-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .document-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .upload-stats {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class DocumentUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private documentService = inject(DocumentService);
  private snackBar = inject(MatSnackBar);

  // Signals
  documents = this.documentService.documents;
  uploadProgress = this.documentService.uploadProgress;
  isDragOver = signal(false);
  isUploading = signal(false);

  // Outputs
  documentsChanged = output<Document[]>();

  triggerFileInput(): void {
    if (!this.isUploading()) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFiles(Array.from(input.files));
      input.value = ''; // Reset input
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isUploading()) {
      this.isDragOver.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (!this.isUploading() && event.dataTransfer?.files) {
      this.uploadFiles(Array.from(event.dataTransfer.files));
    }
  }

  private uploadFiles(files: File[]): void {
    this.isUploading.set(true);

    this.documentService.uploadDocuments(files).subscribe({
      next: (documents) => {
        this.snackBar.open(
          `Successfully uploaded ${documents.length} document${documents.length !== 1 ? 's' : ''}`,
          'Close',
          { duration: 3000 }
        );
        this.documentsChanged.emit(this.documents());
        this.isUploading.set(false);
      },
      error: (error) => {
        this.snackBar.open(`Upload failed: ${error}`, 'Close', { 
          duration: 5000,
          panelClass: 'error-snackbar'
        });
        this.isUploading.set(false);
      }
    });
  }

  removeDocument(id: string): void {
    this.documentService.removeDocument(id).subscribe({
      next: () => {
        this.snackBar.open('Document removed', 'Close', { duration: 2000 });
        this.documentsChanged.emit(this.documents());
      },
      error: (error) => {
        this.snackBar.open(`Failed to remove document: ${error}`, 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  getDocumentIcon(type: string): string {
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word') || type.includes('document')) return 'description';
    if (type.includes('text') || type.includes('markdown')) return 'article';
    return 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getUploadProgress(documentId: string): number {
    return this.uploadProgress()[documentId] || 0;
  }

  getTotalSize(): string {
    const totalBytes = this.documents().reduce((sum, doc) => sum + doc.size, 0);
    return this.formatFileSize(totalBytes);
  }

  getReadyCount(): number {
    return this.documents().filter(doc => doc.status === 'ready').length;
  }
}
