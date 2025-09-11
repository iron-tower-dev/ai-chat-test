import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';

@Component({
  selector: 'app-document-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    DocumentUploadComponent
  ],
  template: `
    <div class="document-dialog">
      <div mat-dialog-title>
        <div class="dialog-header">
          <mat-icon color="primary">cloud_upload</mat-icon>
          <h2>Upload Documents for RAG</h2>
        </div>
      </div>
      
      <div mat-dialog-content>
        <app-document-upload (documentsChanged)="onDocumentsChanged($event)"></app-document-upload>
      </div>
      
      <div mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Done</button>
      </div>
    </div>
  `,
  styles: [`
    .document-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dialog-header h2 {
      margin: 0;
      font-weight: 500;
    }

    @media (max-width: 767px) {
      .document-dialog {
        min-width: 300px;
        max-width: 90vw;
      }
    }
  `]
})
export class DocumentDialogComponent {
  onDocumentsChanged(documents: any[]): void {
    console.log('Documents changed:', documents);
  }
}
