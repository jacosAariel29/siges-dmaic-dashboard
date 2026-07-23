import { Injectable, signal, computed } from '@angular/core';
import { DataService } from './data.service';
import { Incident } from '../models/incident';

export interface Filters {
  modulo: string[];
  estado: string[];
  severidad: string[];
  tipoDefecto: string[];
  mes: string[];
  metodo: string[];
}

@Injectable({ providedIn: 'root' })
export class DmaicFilterService {
  private allIncidents = computed(() => this.dataService.incidents());

  readonly filters = signal<Filters>({
    modulo: [],
    estado: [],
    severidad: [],
    tipoDefecto: [],
    mes: [],
    metodo: [],
  });

  readonly filterOptions = computed(() => {
    const data = this.allIncidents();
    return {
      modulo: [...new Set(data.map(d => d.Modulo))].sort(),
      estado: [...new Set(data.map(d => d.Estado))].sort(),
      severidad: [...new Set(data.map(d => d.Severidad))].sort(),
      tipoDefecto: [...new Set(data.map(d => d['Tipo Defecto']))].sort(),
      mes: [...new Set(data.map(d => d['Año-Mes']))].sort(),
      metodo: [...new Set(data.map(d => d['Metodo Deteccion']))].sort(),
    };
  });

  readonly filteredIncidents = computed(() => {
    const data = this.allIncidents();
    const f = this.filters();
    return data.filter(d => {
      if (f.modulo.length && !f.modulo.includes(d.Modulo)) return false;
      if (f.estado.length && !f.estado.includes(d.Estado)) return false;
      if (f.severidad.length && !f.severidad.includes(d.Severidad)) return false;
      if (f.tipoDefecto.length && !f.tipoDefecto.includes(d['Tipo Defecto'])) return false;
      if (f.mes.length && !f.mes.includes(d['Año-Mes'])) return false;
      if (f.metodo.length && !f.metodo.includes(d['Metodo Deteccion'])) return false;
      return true;
    });
  });

  constructor(private dataService: DataService) {}

  update(key: keyof Filters, value: string[]): void {
    this.filters.update(f => ({ ...f, [key]: value }));
  }

  reset(): void {
    this.filters.set({ modulo: [], estado: [], severidad: [], tipoDefecto: [], mes: [], metodo: [] });
  }

  isActive(): boolean {
    const f = this.filters();
    return Object.values(f).some(v => v.length > 0);
  }
}
