import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dmaic', pathMatch: 'full' },
  {
    path: 'dmaic',
    loadComponent: () => import('./features/dmaic/dmaic').then(m => m.Dmaic),
  },
  { path: '**', redirectTo: 'dmaic' },
];
