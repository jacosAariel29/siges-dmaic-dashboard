import { Component, computed } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { DmaicService } from '../../../core/services/dmaic.service';
import { KpiCard } from '../../../shared/components/kpi-card/kpi-card';
import { TrafficLight } from '../../../shared/components/traffic-light/traffic-light';
import { ExecutiveSummary } from '../../../shared/components/executive-summary/executive-summary';

@Component({
  selector: 'app-dashboard-principal',
  imports: [MatGridListModule, MatCardModule, KpiCard, TrafficLight, ExecutiveSummary],
  template: `
    <div class="dashboard-principal">
      <div class="kpi-grid">
        @for (kpi of dmaicService.kpis(); track kpi.label) {
          <app-kpi-card [kpi]="kpi" />
        }
      </div>
      <div class="bottom-panel">
        <mat-card class="traffic-card">
          <mat-card-header>
            <mat-card-title>Semáforo de KPIs</mat-card-title>
            <mat-card-subtitle>🟢 Cumple meta &nbsp; 🟡 Atención &nbsp; 🔴 Fuera de meta</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-traffic-light [kpis]="dmaicService.kpis()" />
          </mat-card-content>
        </mat-card>
        <app-executive-summary [data]="dmaicService.resumenEjecutivo()" />
      </div>
    </div>
  `,
  styles: [`
    .dashboard-principal { padding: 4px 0; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .bottom-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .traffic-card { border-radius: 12px; }
    @media (max-width: 900px) { .bottom-panel { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .kpi-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardPrincipal {
  constructor(public dmaicService: DmaicService) {}
}
