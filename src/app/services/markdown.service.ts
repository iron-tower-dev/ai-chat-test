import { Injectable } from '@angular/core';
import { marked } from 'marked';
import katex from 'katex';

// Prism is loaded globally via scripts in angular.json
declare const Prism: any;

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  private renderer: any;
  private prismLoaded = false;

  constructor() {
    this.setupMarked();
    this.ensurePrismLoaded();
  }

  private ensurePrismLoaded(): void {
    // Check if Prism is available globally
    if (typeof window !== 'undefined' && (window as any).Prism) {
      this.prismLoaded = true;
    }
  }

  private setupMarked(): void {
    this.renderer = new marked.Renderer();

    // Custom code block renderer with syntax highlighting
    this.renderer.code = (code: string, language: string) => {
      let highlightedCode = code;
      
      if (this.prismLoaded && typeof window !== 'undefined') {
        const globalPrism = (window as any).Prism;
        if (globalPrism && language && globalPrism.languages && globalPrism.languages[language]) {
          try {
            highlightedCode = globalPrism.highlight(code, globalPrism.languages[language], language);
          } catch (e) {
            console.warn('Syntax highlighting failed:', e);
          }
        }
      }

      return `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-language">${language || 'text'}</span>
            <button class="copy-button" onclick="navigator.clipboard.writeText(\`${code.replace(/`/g, '\\`')}\`)">
              <span class="copy-icon">📋</span>
              Copy
            </button>
          </div>
          <pre class="code-block"><code class="language-${language || 'text'}">${highlightedCode}</code></pre>
        </div>
      `;
    };

    // Custom inline code renderer
    this.renderer.codespan = (code: string) => {
      return `<code class="inline-code">${code}</code>`;
    };

    // Custom link renderer with security
    this.renderer.link = (href: string, title: string, text: string) => {
      return `<a href="${href}" ${title ? `title="${title}"` : ''} target="_blank" rel="noopener noreferrer">${text}</a>`;
    };

    // Configure marked options
    marked.setOptions({
      renderer: this.renderer,
      gfm: true,
      breaks: true,
      pedantic: false
    });
  }

  /**
   * Process markdown with LaTeX support
   */
  processMarkdown(content: string): string {
    if (!content) return '';

    try {
      // First, process LaTeX expressions
      const processedContent = this.processLatex(content);
      
      // Then process markdown
      const result = marked(processedContent);
      return typeof result === 'string' ? result : '';
    } catch (error) {
      console.error('Markdown processing error:', error);
      return this.escapeHtml(content);
    }
  }

  /**
   * Process LaTeX expressions in content
   */
  private processLatex(content: string): string {
    // Process block math expressions ($$...$$)
    content = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
      try {
        const rendered = katex.renderToString(latex.trim(), {
          displayMode: true,
          throwOnError: false,
          errorColor: '#cc0000',
          strict: false
        });
        return `<div class="math-block" data-latex="${this.escapeAttribute(latex.trim())}">${rendered}</div>`;
      } catch (error) {
        console.warn('LaTeX block rendering error:', error);
        return `<div class="math-error">LaTeX Error: ${match}</div>`;
      }
    });

    // Process inline math expressions ($...$)
    content = content.replace(/\$([^\$\n]+?)\$/g, (match, latex) => {
      try {
        const rendered = katex.renderToString(latex.trim(), {
          displayMode: false,
          throwOnError: false,
          errorColor: '#cc0000',
          strict: false
        });
        return `<span class="math-inline" data-latex="${this.escapeAttribute(latex.trim())}">${rendered}</span>`;
      } catch (error) {
        console.warn('LaTeX inline rendering error:', error);
        return `<span class="math-error">${match}</span>`;
      }
    });

    return content;
  }

  /**
   * Extract and render standalone LaTeX
   */
  renderLatex(latex: string, displayMode: boolean = false): string {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        errorColor: '#cc0000',
        strict: false
      });
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      return `<span class="math-error">LaTeX Error: ${latex}</span>`;
    }
  }

  /**
   * Get supported code languages
   */
  getSupportedLanguages(): string[] {
    return [
      'typescript',
      'javascript',
      'python',
      'java',
      'csharp',
      'cpp',
      'c',
      'go',
      'rust',
      'php',
      'ruby',
      'swift',
      'kotlin',
      'scala',
      'html',
      'css',
      'scss',
      'json',
      'xml',
      'yaml',
      'markdown',
      'bash',
      'shell',
      'sql',
      'dockerfile',
      'nginx'
    ];
  }

  /**
   * Copy LaTeX source to clipboard
   */
  copyLatexSource(element: HTMLElement): void {
    const latex = element.getAttribute('data-latex');
    if (latex) {
      navigator.clipboard.writeText(latex).then(() => {
        // Show temporary success indicator
        const originalTitle = element.title;
        element.title = 'Copied!';
        setTimeout(() => {
          element.title = originalTitle || 'Click to copy LaTeX source';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy LaTeX:', err);
      });
    }
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape attribute values
   */
  private escapeAttribute(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Strip markdown and return plain text
   */
  stripMarkdown(content: string): string {
    if (!content) return '';
    
    return content
      // Remove LaTeX expressions
      .replace(/\$\$([\s\S]*?)\$\$/g, '')
      .replace(/\$([^\$\n]+?)\$/g, '')
      // Remove markdown syntax
      .replace(/#+\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/>\s/g, '')
      .replace(/^-\s/gm, '')
      .replace(/^\d+\.\s/gm, '')
      .trim();
  }
}
