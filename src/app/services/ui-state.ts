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

  // Dialog/modal states
  private _hasOpenDialog = signal(false);
  readonly hasOpenDialog = this._hasOpenDialog.asReadonly();

  constructor() { }

  // Sidenav actions
  setSidenavOpen(open: boolean): void {
    this._sidenavOpened.set(open);
  }

  toggleSidenav(): void {
    this._sidenavOpened.update(opened => !opened);
  }

  // Loading actions
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }

  // Dialog actions
  setDialogOpen(open: boolean): void {
    this._hasOpenDialog.set(open);
  }
}
