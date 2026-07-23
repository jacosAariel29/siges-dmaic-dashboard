import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KpiItem } from '../../../core/services/dmaic.service';

function trafficColor(value: number, meta: number, dir: 'up' | 'down'): 'green' | 'yellow' | 'red' {
  if (dir === 'up') {
    if (value >= meta) return 'green';
    if (value >= meta * 0.75) return 'yellow';
    return 'red';
  }
  if (value <= meta) return 'green';
  if (value <= meta * 1.5) return 'yellow';
  return 'red';
}

@Component({
  selector: 'app-traffic-light',
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <div class="traffic-grid">
      @for (kpi of kpis(); track kpi.label) {
        <div class="traffic-row" [matTooltip]="'Meta: ' + kpi.meta + (kpi.unit ? ' ' + kpi.unit : '') + ' | ' + kpi.description">
          <span class="tl-label">{{ kpi.label }}</span>
          <span class="tl-value">{{ kpi.value }}{{ kpi.unit ? ' ' + kpi.unit : '' }}</span>
          <span class="tl-dot" [class.green]="color(kpi) === 'green'" [class.yellow]="color(kpi) === 'yellow'" [class.red]="color(kpi) === 'red'">
            <mat-icon>{{ color(kpi) === 'green' ? 'check_circle' : color(kpi) === 'yellow' ? 'warning' : 'cancel' }}</mat-icon>
          </span>
        </div>
      }
    </div>
  `,
  styles: [`
    .traffic-grid { display: flex; flex-direction: column; gap: 6px; }
    .traffic-row { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #F8FAFC; border-radius: 8px; font-size: 13px; }
    .tl-label { flex: 1; font-weight: 500; color: #475569; }
    .tl-value { font-weight: 600; color: #1E293B; min-width: 80px; text-align: right; }
    .tl-dot { display: flex; align-items: center; }
    .tl-dot mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .green mat-icon { color: #10B981; }
    .yellow mat-icon { color: #F59E0B; }
    .red mat-icon { color: #EF4444; }
  `]
})
export class TrafficLight {
  readonly kpis = input.required<KpiItem[]>();
  readonly color = (kpi: KpiItem) => trafficColor(kpi.value, kpi.meta, kpi.metaDir);
}
