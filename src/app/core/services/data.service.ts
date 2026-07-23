import { Injectable, signal } from '@angular/core';
import { Incident } from '../models/incident';

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly incidents = signal<Incident[]>([]);
  readonly loading = signal(true);

  async load(): Promise<void> {
    try {
      const res = await fetch('data/incidents.json');
      const data: Incident[] = await res.json();
      this.incidents.set(data);
    } catch (e) {
      console.error('Failed to load incidents', e);
    } finally {
      this.loading.set(false);
    }
  }
}
