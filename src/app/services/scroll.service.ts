import { Injectable, signal, inject, ElementRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  // Scroll state
  private _userScrolledUp = signal(false);
  private _shouldAutoScroll = signal(true);
  private _isScrollingToBottom = signal(false);

  readonly userScrolledUp = this._userScrolledUp.asReadonly();
  readonly shouldAutoScroll = this._shouldAutoScroll.asReadonly();
  readonly isScrollingToBottom = this._isScrollingToBottom.asReadonly();

  // Auto-scroll threshold (pixels from bottom)
  private readonly AUTO_SCROLL_THRESHOLD = 100;
  private readonly SMOOTH_SCROLL_THRESHOLD = 150;

  /**
   * Handle scroll events to determine if user has scrolled up
   */
  handleScroll(scrollContainer: ElementRef<HTMLElement>): void {
    const element = scrollContainer.nativeElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // User scrolled up if they're not near the bottom
    const hasScrolledUp = distanceFromBottom > this.AUTO_SCROLL_THRESHOLD;
    this._userScrolledUp.set(hasScrolledUp);
    this._shouldAutoScroll.set(!hasScrolledUp);
  }

  /**
   * Scroll to bottom of container
   */
  scrollToBottom(scrollContainer: ElementRef<HTMLElement>, smooth = false): void {
    if (!scrollContainer?.nativeElement) return;

    const element = scrollContainer.nativeElement;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    const distanceFromBottom = scrollHeight - element.scrollTop - clientHeight;

    // Use smooth scrolling for small distances
    const useSmooth = smooth || distanceFromBottom < this.SMOOTH_SCROLL_THRESHOLD;

    this._isScrollingToBottom.set(true);

    element.scrollTo({
      top: scrollHeight,
      behavior: useSmooth ? 'smooth' : 'auto'
    });

    // Reset scrolling state after animation
    setTimeout(() => {
      this._isScrollingToBottom.set(false);
      this._userScrolledUp.set(false);
      this._shouldAutoScroll.set(true);
    }, useSmooth ? 300 : 50);
  }

  /**
   * Scroll to bottom if auto-scroll is enabled
   */
  autoScrollToBottom(scrollContainer: ElementRef<HTMLElement>): void {
    if (this.shouldAutoScroll() && !this.isScrollingToBottom()) {
      this.scrollToBottom(scrollContainer, false);
    }
  }

  /**
   * Force scroll to bottom (ignores user scroll state)
   */
  forceScrollToBottom(scrollContainer: ElementRef<HTMLElement>): void {
    this._userScrolledUp.set(false);
    this._shouldAutoScroll.set(true);
    this.scrollToBottom(scrollContainer, true);
  }

  /**
   * Reset scroll state
   */
  resetScrollState(): void {
    this._userScrolledUp.set(false);
    this._shouldAutoScroll.set(true);
    this._isScrollingToBottom.set(false);
  }

  /**
   * Calculate input height based on content
   */
  calculateInputHeight(element: HTMLTextAreaElement): number {
    if (!element) return 0;

    // Save current styles
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;

    // Reset height to measure scroll height
    element.style.height = '0px';
    element.style.overflow = 'hidden';

    // Get the scroll height (content height)
    const scrollHeight = element.scrollHeight;

    // Restore original styles
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;

    // Return constrained height (min 40px, max 200px)
    return Math.max(40, Math.min(200, scrollHeight));
  }
}
