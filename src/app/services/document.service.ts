import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Document } from '../models/chat.models';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  // Signal for reactive state management
  documents = signal<Document[]>([]);
  uploadProgress = signal<{ [key: string]: number }>({});

  constructor(private mockDataService: MockDataService) {
    this.documents.set([...this.mockDataService.mockDocuments]);
  }

  // Upload single file
  uploadDocument(file: File): Observable<Document> {
    return new Observable<Document>(observer => {
      // Validate file
      const validationError = this.validateFile(file);
      if (validationError) {
        observer.error(validationError);
        return;
      }

      // Create document entry
      const document: Document = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date(),
        status: 'uploading'
      };

      // Add to documents list
      const updatedDocuments = [...this.documents(), document];
      this.documents.set(updatedDocuments);

      // Simulate upload progress
      let progress = 0;
      const uploadInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(uploadInterval);
          
          // Update document status to processing
          const processingDoc = { ...document, status: 'processing' as const };
          this.updateDocument(processingDoc);
          
          // Simulate processing time
          setTimeout(() => {
            // Complete processing
            const readyDoc = { 
              ...processingDoc, 
              status: 'ready' as const,
              content: this.generateMockContent(file.type)
            };
            this.updateDocument(readyDoc);
            observer.next(readyDoc);
            observer.complete();
          }, 1500);
        }
        
        // Update progress
        this.uploadProgress.update(progressMap => ({
          ...progressMap,
          [document.id]: Math.min(progress, 100)
        }));
      }, 200);
    });
  }

  // Upload multiple files
  uploadDocuments(files: File[]): Observable<Document[]> {
    const uploads = files.map(file => this.uploadDocument(file));
    return new Observable<Document[]>(observer => {
      const results: Document[] = [];
      let completed = 0;

      uploads.forEach(upload => {
        upload.subscribe({
          next: (document) => {
            results.push(document);
            completed++;
            if (completed === files.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => observer.error(error)
        });
      });
    });
  }

  // Remove document
  removeDocument(id: string): Observable<boolean> {
    const updatedDocuments = this.documents().filter(d => d.id !== id);
    this.documents.set(updatedDocuments);
    
    // Clean up upload progress
    this.uploadProgress.update(progress => {
      const { [id]: removed, ...rest } = progress;
      return rest;
    });

    return of(true).pipe(delay(100));
  }

  // Get document by ID
  getDocument(id: string): Observable<Document | null> {
    const document = this.documents().find(d => d.id === id) || null;
    return of(document).pipe(delay(50));
  }

  // Get all documents
  getDocuments(): Observable<Document[]> {
    return of(this.documents()).pipe(delay(100));
  }

  // Get documents by status
  getDocumentsByStatus(status: Document['status']): Observable<Document[]> {
    const filtered = this.documents().filter(d => d.status === status);
    return of(filtered).pipe(delay(100));
  }

  private validateFile(file: File): string | null {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];

    if (file.size > maxSize) {
      return `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Supported types: PDF, DOC, DOCX, TXT, MD`;
    }

    return null;
  }

  private generateMockContent(fileType: string): string {
    switch (fileType) {
      case 'application/pdf':
        return 'This is mock content extracted from a PDF document. It contains information about Angular best practices, performance optimization, and modern development techniques.';
      case 'text/markdown':
      case 'text/plain':
        return '# Document Content\n\nThis is mock content from a text document. It includes various topics related to software development, Angular framework, and TypeScript programming.';
      default:
        return 'Mock document content for processing and RAG functionality.';
    }
  }

  private updateDocument(document: Document): void {
    const documents = this.documents();
    const index = documents.findIndex(d => d.id === document.id);
    if (index >= 0) {
      const updatedDocuments = [...documents];
      updatedDocuments[index] = document;
      this.documents.set(updatedDocuments);
    }
  }
}
