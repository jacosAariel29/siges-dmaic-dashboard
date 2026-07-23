import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-chart-card',
  imports: [MatCardModule],
  template: `
    <mat-card class="chart-card">
      <mat-card-header>
        <div class="header-text">
          <mat-card-title>{{ title() }}</mat-card-title>
          <mat-card-subtitle>{{ subtitle() }}</mat-card-subtitle>
        </div>
        <div class="header-actions">
          <ng-content select="[header-action]" />
        </div>
      </mat-card-header>
      <mat-card-content>
        <div class="chart-container">
          <ng-content />
        </div>
        @if (interpretacion()) {
          <div class="chart-interpretacion">
            <div class="interp-section">
              <strong>Interpretación:</strong>
              <p>{{ interpretacion() }}</p>
            </div>
            @if (conclusion()) {
              <div class="interp-section">
                <strong>Conclusión:</strong>
                <p>{{ conclusion() }}</p>
              </div>
            }
            @if (recomendacion()) {
              <div class="interp-section">
                <strong>Recomendación:</strong>
                <p>{{ recomendacion() }}</p>
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .chart-card { margin-bottom: 20px; border-radius: 12px; }
    .chart-container { min-height: 300px; position: relative; padding: 16px 0; }
    .chart-interpretacion { margin-top: 16px; padding-top: 16px; border-top: 1px solid #E2E8F0; }
    .interp-section { margin-bottom: 12px; }
    .interp-section strong { display: block; font-size: 13px; color: #475569; margin-bottom: 4px; }
    .interp-section p { margin: 0; font-size: 13px; color: #64748B; line-height: 1.6; }
    mat-card-header { display: flex; align-items: flex-start; gap: 8px; padding-bottom: 0; }
    .header-text { flex: 1; }
    .header-actions { flex-shrink: 0; padding-top: 4px; }
    mat-card-subtitle { font-size: 13px; }
  `]
})
export class ChartCard {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly interpretacion = input('');
  readonly conclusion = input('');
  readonly recomendacion = input('');
}
