import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/chat',
    pathMatch: 'full'
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat-layout/chat-layout.component').then(m => m.ChatLayoutComponent)
  },
  {
    path: 'chat/:id',
    loadComponent: () => import('./components/chat-layout/chat-layout.component').then(m => m.ChatLayoutComponent)
  },
  {
    path: '**',
    redirectTo: '/chat'
  }
];
