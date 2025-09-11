import { Injectable, signal } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AIModel } from '../models/chat.models';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  // Signal for reactive state management
  availableModels = signal<AIModel[]>([]);
  selectedModel = signal<AIModel | null>(null);

  constructor(private mockDataService: MockDataService) {
    this.initializeModels();
  }

  private initializeModels(): void {
    this.availableModels.set(this.mockDataService.mockModels);
    // Set default model (first online model)
    const defaultModel = this.mockDataService.mockModels.find(m => m.status === 'online');
    if (defaultModel) {
      this.selectedModel.set(defaultModel);
    }
  }

  // Get all available models
  getModels(): Observable<AIModel[]> {
    return of(this.mockDataService.mockModels).pipe(delay(100));
  }

  // Get specific model by ID
  getModel(id: string): Observable<AIModel | null> {
    const model = this.mockDataService.mockModels.find(m => m.id === id) || null;
    return of(model).pipe(delay(50));
  }

  // Get only online models
  getOnlineModels(): Observable<AIModel[]> {
    const onlineModels = this.mockDataService.mockModels.filter(m => m.status === 'online');
    return of(onlineModels).pipe(delay(100));
  }

  // Set selected model
  setSelectedModel(model: AIModel): void {
    this.selectedModel.set(model);
    // Store in localStorage for persistence
    localStorage.setItem('selectedModelId', model.id);
  }

  // Get selected model from localStorage on app init
  initializeSelectedModel(): void {
    const storedModelId = localStorage.getItem('selectedModelId');
    if (storedModelId) {
      const model = this.mockDataService.mockModels.find(m => m.id === storedModelId);
      if (model && model.status === 'online') {
        this.selectedModel.set(model);
        return;
      }
    }
    
    // Fallback to first online model
    const defaultModel = this.mockDataService.mockModels.find(m => m.status === 'online');
    if (defaultModel) {
      this.selectedModel.set(defaultModel);
    }
  }

  // Check if model supports specific capability
  modelSupportsCapability(modelId: string, capability: string): boolean {
    const model = this.mockDataService.mockModels.find(m => m.id === modelId);
    return model?.capabilities.includes(capability) || false;
  }

  // Get models that support RAG
  getRAGSupportedModels(): Observable<AIModel[]> {
    const ragModels = this.mockDataService.mockModels.filter(m => m.supportsRAG);
    return of(ragModels).pipe(delay(100));
  }

  // Simulate model status check
  checkModelStatus(modelId: string): Observable<'online' | 'offline' | 'maintenance'> {
    const model = this.mockDataService.mockModels.find(m => m.id === modelId);
    return of(model?.status || 'offline').pipe(delay(200));
  }
}
