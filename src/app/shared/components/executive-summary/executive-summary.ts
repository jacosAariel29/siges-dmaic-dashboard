import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ResumenEjecutivo } from '../../../core/services/dmaic.service';

@Component({
  selector: 'app-executive-summary',
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="exec-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>summarize</mat-icon>
        <mat-card-title>Resumen Ejecutivo</mat-card-title>
        <mat-card-subtitle>Estado actual del proceso DMAIC</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="exec-body">
          <div class="exec-section">
            <mat-icon>insights</mat-icon>
            <div>
              <strong>Estado del proceso</strong>
              <p>{{ data().estado }}</p>
            </div>
          </div>
          <div class="exec-section">
            <mat-icon>speed</mat-icon>
            <div>
              <strong>Nivel Sigma</strong>
              <p class="sigma-value" [class.good]="data().nivelSigma >= 4" [class.warn]="data().nivelSigma >= 3 && data().nivelSigma < 4" [class.bad]="data().nivelSigma < 3">
                {{ data().nivelSigma }} σ
              </p>
            </div>
          </div>
          @if (data().riesgos.length) {
            <div class="exec-section">
              <mat-icon>warning</mat-icon>
              <div>
                <strong>Riesgos actuales</strong>
                <ul>
                  @for (r of data().riesgos; track r) {
                    <li>{{ r }}</li>
                  }
                </ul>
              </div>
            </div>
          }
          <div class="exec-section">
            <mat-icon>lightbulb</mat-icon>
            <div>
              <strong>Recomendación principal</strong>
              <p>{{ data().recomendacion }}</p>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .exec-card { border-radius: 12px; border-left: 4px solid #3B82F6; }
    .exec-body { display: flex; flex-direction: column; gap: 16px; }
    .exec-section { display: flex; gap: 12px; align-items: flex-start; }
    .exec-section mat-icon { font-size: 24px; width: 24px; height: 24px; color: #3B82F6; margin-top: 2px; }
    .exec-section strong { display: block; font-size: 14px; color: #1E293B; margin-bottom: 4px; }
    .exec-section p { margin: 0; font-size: 13px; color: #64748B; line-height: 1.6; }
    .exec-section ul { margin: 0; padding-left: 16px; }
    .exec-section li { font-size: 13px; color: #64748B; margin-bottom: 4px; }
    .sigma-value { font-size: 24px !important; font-weight: 700 !important; }
    .sigma-value.good { color: #10B981 !important; }
    .sigma-value.warn { color: #F59E0B !important; }
    .sigma-value.bad { color: #EF4444 !important; }
    mat-card-header { padding-bottom: 0; }
    mat-icon[mat-card-avatar] { color: #3B82F6; }
  `]
})
export class ExecutiveSummary {
  readonly data = input.required<ResumenEjecutivo>();
}
