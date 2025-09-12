import { Injectable, signal, computed, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private breakpointObserver = inject(BreakpointObserver);

  // Breakpoint state
  private _isMobile = signal(false);
  readonly isMobile = this._isMobile.asReadonly();

  // Sidenav mode based on screen size
  readonly sidenavMode = computed(() => {
    return this.isMobile() ? 'over' : 'side';
  });

  // Sidebar width
  readonly sidebarWidth = 320;
  readonly mobileSidebarWidth = 280;

  constructor() {
    // Monitor breakpoint changes
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe(result => {
        this._isMobile.set(result.matches);
      });

    // Initial check
    this._isMobile.set(this.breakpointObserver.isMatched(['(max-width: 767px)']));
  }

  // Get sidebar width based on device
  getSidebarWidth(): number {
    return this.isMobile() ? this.mobileSidebarWidth : this.sidebarWidth;
  }
}
