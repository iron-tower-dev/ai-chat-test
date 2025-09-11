import { Injectable, signal } from '@angular/core';
import { Observable, BehaviorSubject, delay, of } from 'rxjs';
import { Conversation, Message, StreamingResponse, ChatHistoryFilter } from '../models/chat.models';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private currentConversationSubject = new BehaviorSubject<Conversation | null>(null);
  private streamingResponseSubject = new BehaviorSubject<StreamingResponse | null>(null);

  // Signals for reactive state management
  conversations = signal<Conversation[]>([]);
  currentConversation = signal<Conversation | null>(null);
  isStreaming = signal<boolean>(false);
  streamingMessage = signal<string>('');

  constructor(private mockDataService: MockDataService) {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockConversations = this.mockDataService.generateMockConversations();
    this.conversations.set(mockConversations);
    this.conversationsSubject.next(mockConversations);
  }

  // Get all conversations
  getConversations(filter?: ChatHistoryFilter): Observable<Conversation[]> {
    let conversations = this.conversations();

    if (filter) {
      conversations = this.applyFilter(conversations, filter);
    }

    return of(conversations).pipe(delay(100)); // Simulate network delay
  }

  // Get specific conversation by ID
  getConversation(id: string): Observable<Conversation | null> {
    const conversation = this.conversations().find(c => c.id === id) || null;
    return of(conversation).pipe(delay(50));
  }

  // Create new conversation
  createConversation(title?: string, modelId?: string): Observable<Conversation> {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: title || 'New Conversation',
      messages: [],
      modelId: modelId || this.mockDataService.mockModels[0].id,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isArchived: false
    };

    const updatedConversations = [newConversation, ...this.conversations()];
    this.conversations.set(updatedConversations);
    this.conversationsSubject.next(updatedConversations);
    this.setCurrentConversation(newConversation);

    return of(newConversation).pipe(delay(50));
  }

  // Send message and get streaming response
  sendMessage(conversationId: string, content: string, modelId?: string): Observable<StreamingResponse> {
    return new Observable<StreamingResponse>(observer => {
      const conversation = this.conversations().find(c => c.id === conversationId);
      if (!conversation) {
        observer.error('Conversation not found');
        return;
      }

      // Create user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        content,
        type: 'user',
        timestamp: new Date(),
        status: 'sent'
      };

      // Update conversation with user message
      this.addMessageToConversation(conversationId, userMessage);

      // Start streaming simulation
      this.isStreaming.set(true);
      this.streamingMessage.set('');

      const aiMessageId = `msg-${Date.now() + 1}`;
      const fullResponse = this.mockDataService.getRandomResponse();
      const chunks = this.splitIntoChunks(fullResponse);
      let currentResponse = '';

      // Stream response chunks
      chunks.forEach((chunk, index) => {
        setTimeout(() => {
          currentResponse += chunk;
          this.streamingMessage.set(currentResponse);

          const streamingResponse: StreamingResponse = {
            id: `stream-${Date.now()}-${index}`,
            conversationId,
            messageId: aiMessageId,
            chunk,
            isComplete: index === chunks.length - 1,
            metadata: {
              tokensPerSecond: 25 + Math.random() * 10,
              totalTokens: Math.ceil(fullResponse.length / 4)
            }
          };

          observer.next(streamingResponse);

          if (streamingResponse.isComplete) {
            // Create final AI message
            const aiMessage: Message = {
              id: aiMessageId,
              conversationId,
              content: currentResponse,
              type: 'ai',
              timestamp: new Date(),
              status: 'sent',
              modelId: modelId || conversation.modelId,
              citations: Math.random() > 0.7 ? [this.mockDataService.mockCitations[0]] : undefined,
              tokens: Math.ceil(fullResponse.length / 4),
              streamingComplete: true
            };

            this.addMessageToConversation(conversationId, aiMessage);
            this.isStreaming.set(false);
            this.streamingMessage.set('');
            observer.complete();
          }
        }, index * 100 + Math.random() * 50); // Simulate variable streaming speed
      });
    });
  }

  // Set current active conversation
  setCurrentConversation(conversation: Conversation | null): void {
    this.currentConversation.set(conversation);
    this.currentConversationSubject.next(conversation);
  }

  // Delete conversation
  deleteConversation(id: string): Observable<boolean> {
    const updatedConversations = this.conversations().filter(c => c.id !== id);
    this.conversations.set(updatedConversations);
    this.conversationsSubject.next(updatedConversations);

    // If deleted conversation was current, clear current
    if (this.currentConversation()?.id === id) {
      this.setCurrentConversation(null);
    }

    return of(true).pipe(delay(50));
  }

  // Delete multiple conversations
  deleteConversations(ids: string[]): Observable<boolean> {
    const updatedConversations = this.conversations().filter(c => !ids.includes(c.id));
    this.conversations.set(updatedConversations);
    this.conversationsSubject.next(updatedConversations);

    // If current conversation was deleted, clear it
    if (this.currentConversation() && ids.includes(this.currentConversation()!.id)) {
      this.setCurrentConversation(null);
    }

    return of(true).pipe(delay(100));
  }

  // Update conversation title
  updateConversationTitle(id: string, title: string): Observable<Conversation> {
    const conversations = this.conversations();
    const conversation = conversations.find(c => c.id === id);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updatedConversation = { ...conversation, title, updatedAt: new Date() };
    const updatedConversations = conversations.map(c => 
      c.id === id ? updatedConversation : c
    );

    this.conversations.set(updatedConversations);
    this.conversationsSubject.next(updatedConversations);

    // Update current conversation if it's the one being updated
    if (this.currentConversation()?.id === id) {
      this.setCurrentConversation(updatedConversation);
    }

    return of(updatedConversation).pipe(delay(50));
  }

  // Pin/unpin conversation
  toggleConversationPin(id: string): Observable<Conversation> {
    const conversations = this.conversations();
    const conversation = conversations.find(c => c.id === id);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updatedConversation = { 
      ...conversation, 
      isPinned: !conversation.isPinned, 
      updatedAt: new Date() 
    };
    
    const updatedConversations = conversations.map(c => 
      c.id === id ? updatedConversation : c
    );

    this.conversations.set(updatedConversations);
    this.conversationsSubject.next(updatedConversations);

    return of(updatedConversation).pipe(delay(50));
  }

  // Archive conversation
  archiveConversation(id: string): Observable<Conversation> {
    const conversations = this.conversations();
    const conversation = conversations.find(c => c.id === id);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const updatedConversation = { 
      ...conversation, 
      isArchived: true, 
      updatedAt: new Date() 
    };
    
    const updatedConversations = conversations.map(c => 
      c.id === id ? updatedConversation : c
    );

    this.conversations.set(updatedConversations);
    this.conversationsSubject.next(updatedConversations);

    return of(updatedConversation).pipe(delay(50));
  }

  // Search conversations
  searchConversations(query: string): Observable<Conversation[]> {
    const filtered = this.conversations().filter(conversation => 
      conversation.title.toLowerCase().includes(query.toLowerCase()) ||
      conversation.messages.some(message => 
        message.content.toLowerCase().includes(query.toLowerCase())
      )
    );

    return of(filtered).pipe(delay(200));
  }

  private addMessageToConversation(conversationId: string, message: Message): void {
    const conversations = this.conversations();
    const conversationIndex = conversations.findIndex(c => c.id === conversationId);
    
    if (conversationIndex === -1) return;

    const updatedConversation = {
      ...conversations[conversationIndex],
      messages: [...conversations[conversationIndex].messages, message],
      updatedAt: new Date()
    };

    const updatedConversations = [...conversations];
    updatedConversations[conversationIndex] = updatedConversation;

    this.conversations.set(updatedConversations);
    this.conversationsSubject.next(updatedConversations);

    // Update current conversation if it's the one being updated
    if (this.currentConversation()?.id === conversationId) {
      this.setCurrentConversation(updatedConversation);
    }
  }

  private splitIntoChunks(text: string, chunkSize: number = 15): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk + (i + chunkSize < words.length ? ' ' : ''));
    }

    return chunks;
  }

  private applyFilter(conversations: Conversation[], filter: ChatHistoryFilter): Conversation[] {
    let filtered = [...conversations];

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(query) ||
        conv.messages.some(msg => msg.content.toLowerCase().includes(query))
      );
    }

    if (filter.dateRange) {
      filtered = filtered.filter(conv => 
        conv.createdAt >= filter.dateRange!.start && 
        conv.createdAt <= filter.dateRange!.end
      );
    }

    if (filter.modelIds && filter.modelIds.length > 0) {
      filtered = filtered.filter(conv => filter.modelIds!.includes(conv.modelId));
    }

    if (filter.hasDocuments !== undefined) {
      filtered = filtered.filter(conv => 
        filter.hasDocuments ? conv.documents.length > 0 : conv.documents.length === 0
      );
    }

    if (filter.hasFeedback !== undefined) {
      filtered = filtered.filter(conv => 
        conv.messages.some(msg => !!msg.feedback) === filter.hasFeedback
      );
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(conv => 
        conv.tags && filter.tags!.some(tag => conv.tags!.includes(tag))
      );
    }

    return filtered;
  }
}
