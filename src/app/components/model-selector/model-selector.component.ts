import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { ModelService } from '../../services/model.service';
import { AIModel } from '../../models/chat.models';

@Component({
  selector: 'app-model-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <mat-form-field appearance="outline" class="model-selector">
      <mat-label>AI Model</mat-label>
      <mat-select 
        [value]="selectedModel()?.id"
        (selectionChange)="onModelChange($event.value)"
        [disabled]="isLoading()">
        
        @for (model of availableModels(); track model.id) {
          <mat-option [value]="model.id" [disabled]="model.status !== 'online'">
            <div class="model-option">
              <div class="model-header">
                <span class="model-name">{{ model.name }}</span>
                <div class="model-status">
                  @switch (model.status) {
                    @case ('online') {
                      <mat-icon class="status-icon online" matTooltip="Online">fiber_manual_record</mat-icon>
                    }
                    @case ('offline') {
                      <mat-icon class="status-icon offline" matTooltip="Offline">fiber_manual_record</mat-icon>
                    }
                    @case ('maintenance') {
                      <mat-icon class="status-icon maintenance" matTooltip="Under Maintenance">build</mat-icon>
                    }
                  }
                </div>
              </div>
              <div class="model-description">{{ model.description }}</div>
              <div class="model-metadata">
                <div class="model-chips">
                  <mat-chip class="speed-chip" [class]="'speed-' + model.performance.speed">
                    {{ model.performance.speed | titlecase }}
                  </mat-chip>
                  <mat-chip class="accuracy-chip">
                    {{ model.performance.accuracy }}% Accurate
                  </mat-chip>
                  @if (model.supportsRAG) {
                    <mat-chip class="feature-chip">RAG</mat-chip>
                  }
                  @if (model.supportsCodeGeneration) {
                    <mat-chip class="feature-chip">Code</mat-chip>
                  }
                </div>
              </div>
            </div>
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .model-selector {
      min-width: 200px;
      max-width: 300px;
    }

    .model-option {
      padding: 8px 0;
    }

    .model-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .model-name {
      font-weight: 500;
      font-size: 14px;
    }

    .model-status {
      display: flex;
      align-items: center;
    }

    .status-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .status-icon.online {
      color: #4caf50;
    }

    .status-icon.offline {
      color: #f44336;
    }

    .status-icon.maintenance {
      color: #ff9800;
    }

    .model-description {
      font-size: 12px;
      color: var(--mat-form-field-disabled-input-text-color);
      margin-bottom: 8px;
      line-height: 1.3;
    }

    .model-metadata {
      display: flex;
      flex-direction: column;
    }

    .model-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .model-chips mat-chip {
      font-size: 10px;
      min-height: 20px;
      padding: 2px 6px;
    }

    .speed-chip.speed-fast {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .speed-chip.speed-medium {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    .speed-chip.speed-slow {
      background-color: #ffebee;
      color: #c62828;
    }

    .accuracy-chip {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .feature-chip {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    /* Mobile adjustments */
    @media (max-width: 599px) {
      .model-selector {
        min-width: 120px;
        max-width: 180px;
      }

      .model-selector ::ng-deep .mat-mdc-form-field-infix {
        font-size: 14px;
      }
    }
  `]
})
export class ModelSelectorComponent implements OnInit {
  private modelService = inject(ModelService);

  // Signals
  availableModels = this.modelService.availableModels;
  selectedModel = this.modelService.selectedModel;
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadModels();
  }

  private loadModels(): void {
    this.isLoading.set(true);
    this.modelService.getModels().subscribe({
      next: (models) => {
        this.availableModels.set(models);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading models:', error);
        this.isLoading.set(false);
      }
    });
  }

  onModelChange(modelId: string): void {
    const model = this.availableModels().find(m => m.id === modelId);
    if (model && model.status === 'online') {
      this.modelService.setSelectedModel(model);
    }
  }
}
