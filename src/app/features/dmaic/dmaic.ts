import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FilterPanel } from '../../shared/components/filter-panel/filter-panel';
import { DashboardPrincipal } from './dashboard/dashboard-principal';
import { Graficos } from './graficos/graficos';
import { Tablas } from './tablas/tablas';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-dmaic',
  imports: [MatTabsModule, MatIconModule, MatToolbarModule, FilterPanel, DashboardPrincipal, Graficos, Tablas],
  template: `
    <div class="dmaic-shell">
      <mat-toolbar class="dmaic-header">
        <mat-icon class="header-icon">assessment</mat-icon>
        <span class="header-title">Dashboard DMAIC</span>
        <span class="header-subtitle">Sistema de Gestión de Incidencias — SIGES 3.0</span>
        <span class="header-spacer"></span>
        <span class="header-count">
          {{ dataService.incidents().length }} registros
        </span>
      </mat-toolbar>

      <div class="dmaic-body">
        <app-filter-panel />

        <mat-tab-group class="dmaic-tabs" animationDuration="300ms" dynamicHeight>
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>dashboard</mat-icon>
              Dashboard Principal
            </ng-template>
            <div class="tab-content">
              <app-dashboard-principal />
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>bar_chart</mat-icon>
              Gráficos
            </ng-template>
            <div class="tab-content">
              <app-graficos />
            </div>
          </mat-tab>

          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>table_chart</mat-icon>
              Tablas
            </ng-template>
            <div class="tab-content">
              <app-tablas />
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .dmaic-shell { display: flex; flex-direction: column; height: 100vh; background: #F4F6FA; }
    .dmaic-header { background: white !important; border-bottom: 1px solid #E2E8F0; gap: 8px; }
    .header-icon { color: #3B82F6; margin-right: 4px; }
    .header-title { font-weight: 700; font-size: 18px; color: #1E293B; }
    .header-subtitle { font-size: 13px; color: #94A3B8; margin-left: 12px; }
    .header-spacer { flex: 1; }
    .header-count { font-size: 13px; color: #64748B; background: #F1F5F9; padding: 4px 12px; border-radius: 16px; }
    .dmaic-body { flex: 1; overflow-y: auto; padding: 20px; }
    .tab-content { padding: 20px 0; }
    .dmaic-tabs { background: transparent; }
    mat-tab-group { --mat-tab-header-active-label-text-color: #3B82F6; --mat-tab-header-active-ripple-color: #3B82F6; }
    mat-tab-label { gap: 4px; }
    mat-tab-label mat-icon { font-size: 18px; width: 18px; height: 18px; margin-right: 4px; }
  `]
})
export class Dmaic {
  constructor(public dataService: DataService) {}
}
