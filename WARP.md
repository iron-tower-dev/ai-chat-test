# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Commands
```bash
# Start development server (runs on http://localhost:4200)
ng serve
# or
npm start

# Build for production
ng build

# Run unit tests with Karma
ng test

# Build and watch for changes in development mode
ng build --watch --configuration development
```

### Angular CLI Commands
```bash
# Generate new component
ng generate component component-name

# Generate new service
ng generate service service-name

# Generate new directive
ng generate directive directive-name

# View all available schematics
ng generate --help
```

### Code Formatting
- Prettier is configured with custom settings in package.json
- Print width: 100 characters
- Single quotes enabled
- Angular HTML parser for templates

## Project Architecture

This is a modern Angular 20+ chatbot application using standalone components and the latest Angular features including signals, control flow syntax, and input/output functions.

### Key Architectural Patterns

**Standalone Components Architecture:**
- All components use standalone architecture (no NgModules)
- Lazy loading implemented for routes via dynamic imports
- Material Design components integrated throughout

**Signal-Based State Management:**
- Services use Angular signals for reactive state management
- `computed()` used for derived state
- State transformations use `set()` and `update()` instead of `mutate()`

**Component Structure:**
- Components use `input()` and `output()` functions instead of decorators
- OnPush change detection strategy
- Host bindings placed in component decorator's `host` object
- Native control flow (`@if`, `@for`, `@switch`) instead of structural directives

### Core Services

**ChatService (`src/app/services/chat.service.ts`):**
- Manages conversation state using signals
- Provides mock streaming chat responses
- Handles conversation CRUD operations
- Implements conversation filtering and search

**ModelService (`src/app/services/model.service.ts`):**
- Manages AI model selection and state
- Persists model preference to localStorage

**MockDataService (`src/app/services/mock-data.service.ts`):**
- Provides mock data for development
- Generates sample conversations, models, and responses

### Component Architecture

**Layout Structure:**
- `ChatLayoutComponent`: Main layout with responsive sidenav
- `ChatHistorySidebarComponent`: Conversation history and management
- `ChatAreaComponent`: Message display and input interface
- `ModelSelectorComponent`: AI model selection dropdown

**Specialized Components:**
- `MessageDisplayComponent`: Handles message rendering with markdown support
- `DocumentUploadComponent`: File upload for RAG functionality
- `FeedbackDialogComponent`: Message feedback collection

### Data Models

**Core Entities (`src/app/models/chat.models.ts`):**
- `Conversation`: Chat sessions with messages, metadata, and documents
- `Message`: Individual messages with streaming support and citations
- `AIModel`: AI model configurations with performance metrics
- `Document`: File attachments for RAG functionality
- `MessageFeedback`: User feedback on AI responses

### Technology Stack

**Frontend Framework:**
- Angular 20.3.0 with standalone components
- Angular Material 20.2.2 for UI components
- Angular CDK for layout and accessibility

**Content Processing:**
- ngx-markdown for message rendering
- Marked.js for markdown parsing
- KaTeX for mathematical expressions
- Prism.js for code highlighting

**Development Tools:**
- TypeScript 5.9.2 with strict type checking
- Jasmine and Karma for unit testing
- Angular CLI 20.3.0 for development tooling

### Responsive Design
- Mobile-first approach with breakpoint-based layout
- Sidenav switches between 'over' and 'side' modes
- Responsive toolbar and component sizing
- Touch-friendly interface elements

### Key Features
- Real-time message streaming simulation
- Document upload for RAG (Retrieval-Augmented Generation)
- Conversation management (create, delete, archive, pin)
- Message feedback system
- Model switching capabilities
- Mobile-responsive design

## Development Guidelines

### Angular Best Practices (from .claude/CLAUDE.md)
- Use standalone components (default behavior)
- Implement signals for state management
- Use `input()` and `output()` functions instead of decorators
- Apply OnPush change detection strategy
- Use native control flow syntax (`@if`, `@for`, `@switch`)
- Prefer `inject()` function over constructor injection
- Use `NgOptimizedImage` for static images
- Avoid `@HostBinding`/`@HostListener` - use `host` object instead

### TypeScript Guidelines
- Maintain strict type checking
- Avoid `any` type - use `unknown` when uncertain
- Leverage type inference when obvious

### Code Quality
- Keep components focused on single responsibility
- Use Reactive forms over Template-driven forms
- Prefer `class` bindings over `ngClass`
- Prefer `style` bindings over `ngStyle`
- Keep templates simple and avoid complex logic

### Testing
- Unit tests use Jasmine with Karma test runner
- Tests located alongside component files with `.spec.ts` extension

### File Structure Conventions
- Components in `src/app/components/`
- Services in `src/app/services/`
- Models and interfaces in `src/app/models/`
- Styles use SCSS with component-scoped styling
- Angular Material theming configured globally
