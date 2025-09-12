import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  // Sidenav state
  private _sidenavOpened = signal(true);
  readonly sidenavOpened = this._sidenavOpened.asReadonly();

  // Loading states
  private _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  // Dialog/Modal states
  private _activeModal = signal<string | null>(null);
  readonly activeModal = this._activeModal.asReadonly();

  // Methods to update sidenav state
  setSidenavOpened(opened: boolean): void {
    this._sidenavOpened.set(opened);
  }

  toggleSidenav(): void {
    this._sidenavOpened.update(v => !v);
  }

  // Methods to update loading state
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  // Methods to manage modal state
  setActiveModal(modalId: string | null): void {
    this._activeModal.set(modalId);
  }

  closeModal(): void {
    this._activeModal.set(null);
  }

  isModalActive(modalId: string): boolean {
    return this.activeModal() === modalId;
  }
}
