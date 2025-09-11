import { Injectable } from '@angular/core';
import { AIModel, Conversation, Message, Document, Citation } from '../models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  readonly mockModels: AIModel[] = [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Latest multimodal model with advanced reasoning capabilities',
      version: '2024-11',
      capabilities: ['Text generation', 'Code generation', 'RAG', 'Mathematical reasoning'],
      status: 'online',
      performance: { speed: 'fast', accuracy: 95 },
      tokenLimit: 128000,
      supportsRAG: true,
      supportsCodeGeneration: true
    },
    {
      id: 'claude-3-5-sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Advanced language model with strong analytical capabilities',
      version: '20241022',
      capabilities: ['Text generation', 'Code generation', 'Analysis', 'RAG'],
      status: 'online',
      performance: { speed: 'medium', accuracy: 97 },
      tokenLimit: 200000,
      supportsRAG: true,
      supportsCodeGeneration: true
    },
    {
      id: 'llama-3-1-70b',
      name: 'Llama 3.1 70B',
      description: 'Open-source large language model with multilingual support',
      version: '3.1',
      capabilities: ['Text generation', 'Multilingual', 'Code generation'],
      status: 'maintenance',
      performance: { speed: 'slow', accuracy: 88 },
      tokenLimit: 128000,
      supportsRAG: true,
      supportsCodeGeneration: true
    }
  ];

  readonly mockDocuments: Document[] = [
    {
      id: 'doc-1',
      name: 'Angular Best Practices.pdf',
      type: 'application/pdf',
      size: 2048000,
      uploadDate: new Date('2024-01-15'),
      status: 'ready',
      content: 'Angular best practices document content...',
      metadata: { pages: 25, language: 'en' }
    },
    {
      id: 'doc-2',
      name: 'API Documentation.md',
      type: 'text/markdown',
      size: 512000,
      uploadDate: new Date('2024-01-20'),
      status: 'ready',
      content: '# API Documentation\n\nThis document describes the API endpoints...',
      metadata: { wordCount: 1500 }
    }
  ];

  readonly mockCitations: Citation[] = [
    {
      id: 'cite-1',
      documentId: 'doc-1',
      documentName: 'Angular Best Practices.pdf',
      excerpt: 'Use OnPush change detection strategy to improve performance in Angular applications.',
      pageNumber: 15,
      section: 'Performance Optimization',
      confidence: 0.95
    },
    {
      id: 'cite-2',
      documentId: 'doc-2',
      documentName: 'API Documentation.md',
      excerpt: 'The streaming endpoint supports real-time data transmission using Server-Sent Events.',
      section: 'Streaming API',
      confidence: 0.89
    }
  ];

  readonly sampleResponses: string[] = [
    `# Angular Performance Optimization

    When working with Angular applications, there are several key strategies to improve performance:

    ## Change Detection Strategy
    
    Using OnPush change detection can significantly improve performance:
    
    \`\`\`typescript
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush
    })
    export class MyComponent {}
    \`\`\`
    
    ## Mathematical Example
    
    For calculating component render time, we can use:
    
    $$t_{render} = \\frac{n \\cdot c}{p}$$
    
    Where:
    - $t_{render}$ = total render time
    - $n$ = number of components
    - $c$ = average component complexity
    - $p$ = processing power
    
    This helps optimize rendering performance.`,

    `Here's a comprehensive guide to implementing signals in Angular:

    ## Signal Basics
    
    \`\`\`typescript
    import { signal, computed } from '@angular/core';
    
    export class CounterComponent {
      count = signal(0);
      doubled = computed(() => this.count() * 2);
      
      increment() {
        this.count.update(value => value + 1);
      }
    }
    \`\`\`
    
    ## Benefits
    
    1. **Reactive updates** - Automatic UI updates
    2. **Performance** - Minimal change detection
    3. **Type safety** - Full TypeScript support
    
    The efficiency gain can be calculated as:
    
    $efficiency = \\frac{signals_{updates}}{traditional_{updates}} \\times 100\\%$`,

    `Let me help you understand TypeScript best practices:

    ## Type Definitions
    
    \`\`\`typescript
    interface User {
      readonly id: string;
      name: string;
      email: string;
      preferences?: UserPreferences;
    }
    
    type UserRole = 'admin' | 'user' | 'guest';
    \`\`\`
    
    ## Utility Types
    
    TypeScript provides powerful utility types:
    
    - \`Partial<T>\` - Makes all properties optional
    - \`Required<T>\` - Makes all properties required
    - \`Pick<T, K>\` - Creates subset with specific keys
    
    ## Generic Constraints
    
    \`\`\`typescript
    function processData<T extends { id: string }>(data: T[]): T[] {
      return data.filter(item => item.id.length > 0);
    }
    \`\`\`
    
    This ensures type safety while maintaining flexibility.`
  ];

  generateMockConversations(): Conversation[] {
    const conversations: Conversation[] = [];
    const now = new Date();

    for (let i = 0; i < 15; i++) {
      const conversationId = `conv-${i + 1}`;
      const createdAt = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      
      const messages: Message[] = [
        {
          id: `msg-${i}-1`,
          conversationId,
          content: this.getUserQuestions()[i % this.getUserQuestions().length],
          type: 'user',
          timestamp: createdAt,
          status: 'sent'
        },
        {
          id: `msg-${i}-2`,
          conversationId,
          content: this.sampleResponses[i % this.sampleResponses.length],
          type: 'ai',
          timestamp: new Date(createdAt.getTime() + 5000),
          status: 'sent',
          modelId: this.mockModels[i % this.mockModels.length].id,
          citations: i % 3 === 0 ? [this.mockCitations[i % this.mockCitations.length]] : undefined,
          tokens: 150 + Math.floor(Math.random() * 300),
          streamingComplete: true
        }
      ];

      conversations.push({
        id: conversationId,
        title: this.getConversationTitles()[i % this.getConversationTitles().length],
        summary: `Discussion about ${this.getConversationTitles()[i % this.getConversationTitles().length].toLowerCase()}`,
        messages,
        modelId: this.mockModels[i % this.mockModels.length].id,
        documents: i % 4 === 0 ? [this.mockDocuments[i % this.mockDocuments.length]] : [],
        createdAt,
        updatedAt: new Date(createdAt.getTime() + 10000),
        isPinned: i < 3,
        isArchived: false,
        tags: i % 5 === 0 ? ['important', 'development'] : undefined
      });
    }

    return conversations;
  }

  private getUserQuestions(): string[] {
    return [
      "How can I optimize Angular performance?",
      "Explain Angular signals and their benefits",
      "What are TypeScript best practices?",
      "How do I implement lazy loading in Angular?",
      "What's the difference between OnPush and Default change detection?",
      "How to handle forms in Angular with reactive forms?",
      "Explain Angular dependency injection",
      "How to implement routing guards?",
      "What are Angular directives and how to create custom ones?",
      "How to handle HTTP errors in Angular?",
      "Explain Angular lifecycle hooks",
      "How to implement unit testing in Angular?",
      "What is Angular Universal and server-side rendering?",
      "How to optimize bundle size in Angular?",
      "Explain Angular animations and transitions"
    ];
  }

  private getConversationTitles(): string[] {
    return [
      "Angular Performance Tips",
      "Understanding Signals",
      "TypeScript Best Practices",
      "Lazy Loading Implementation",
      "Change Detection Strategies",
      "Reactive Forms Guide",
      "Dependency Injection Deep Dive",
      "Routing Guards Tutorial",
      "Custom Directives",
      "HTTP Error Handling",
      "Component Lifecycle",
      "Unit Testing Strategies",
      "Server-Side Rendering",
      "Bundle Optimization",
      "Animation Techniques"
    ];
  }

  getRandomResponse(): string {
    return this.sampleResponses[Math.floor(Math.random() * this.sampleResponses.length)];
  }
}
