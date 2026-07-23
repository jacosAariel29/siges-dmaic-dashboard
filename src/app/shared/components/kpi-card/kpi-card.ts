import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KpiItem } from '../../../core/services/dmaic.service';

@Component({
  selector: 'app-kpi-card',
  imports: [MatIconModule, MatTooltipModule],
  template: `
    <div class="kpi-card" [style.border-left-color]="kpi().color">
      <div class="kpi-header">
        <span class="kpi-icon" [style.background]="kpi().color + '18'" [style.color]="kpi().color">
          <mat-icon>{{ kpi().icon }}</mat-icon>
        </span>
        <span class="kpi-label" [matTooltip]="kpi().description">{{ kpi().label }}</span>
      </div>
      <div class="kpi-value">{{ kpi().value }}{{ kpi().unit ? ' ' + kpi().unit : '' }}</div>
      <div class="kpi-footer">
        @if (kpi().previous !== undefined) {
          <span class="kpi-variacion" [class.up]="kpi().value >= (kpi().previous ?? 0)" [class.down]="kpi().value < (kpi().previous ?? 0)">
            <mat-icon>{{ kpi().value >= (kpi().previous ?? 0) ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
            {{ kpi().value - (kpi().previous ?? 0) > 0 ? '+' : '' }}{{ kpi().value - (kpi().previous ?? 0) }}
          </span>
        }
        <span class="kpi-desc">{{ kpi().description }}</span>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border-left: 4px solid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .kpi-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .kpi-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .kpi-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .kpi-label { font-size: 13px; font-weight: 500; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #1E293B; margin-bottom: 8px; }
    .kpi-footer { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .kpi-variacion { display: flex; align-items: center; gap: 2px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
    .kpi-variacion.up { color: #10B981; background: #10B98118; }
    .kpi-variacion.down { color: #EF4444; background: #EF444418; }
    .kpi-variacion mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .kpi-desc { color: #94A3B8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `]
})
export class KpiCard {
  readonly kpi = input.required<KpiItem>();
}
