import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { DmaicFilterService, Filters } from '../../../core/services/dmaic-filter.service';

@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule, MatExpansionModule],
  template: `
    <mat-accordion>
      <mat-expansion-panel [expanded]="true" class="filter-panel">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <mat-icon>filter_list</mat-icon> Filtros
            @if (filterService.isActive()) {
              <span class="active-badge">Activos</span>
            }
          </mat-panel-title>
        </mat-expansion-panel-header>
        <div class="filter-grid">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Módulo</mat-label>
            <mat-select [value]="filterService.filters().modulo" (valueChange)="filterService.update('modulo', $event)" multiple>
              @for (opt of filterService.filterOptions().modulo; track opt) {
                <mat-option [value]="opt">{{ opt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Estado</mat-label>
            <mat-select [value]="filterService.filters().estado" (valueChange)="filterService.update('estado', $event)" multiple>
              @for (opt of filterService.filterOptions().estado; track opt) {
                <mat-option [value]="opt">{{ opt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Severidad</mat-label>
            <mat-select [value]="filterService.filters().severidad" (valueChange)="filterService.update('severidad', $event)" multiple>
              @for (opt of filterService.filterOptions().severidad; track opt) {
                <mat-option [value]="opt">{{ opt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Tipo Defecto</mat-label>
            <mat-select [value]="filterService.filters().tipoDefecto" (valueChange)="filterService.update('tipoDefecto', $event)" multiple>
              @for (opt of filterService.filterOptions().tipoDefecto; track opt) {
                <mat-option [value]="opt">{{ opt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Mes</mat-label>
            <mat-select [value]="filterService.filters().mes" (valueChange)="filterService.update('mes', $event)" multiple>
              @for (opt of filterService.filterOptions().mes; track opt) {
                <mat-option [value]="opt">{{ opt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Método Detección</mat-label>
            <mat-select [value]="filterService.filters().metodo" (valueChange)="filterService.update('metodo', $event)" multiple>
              @for (opt of filterService.filterOptions().metodo; track opt) {
                <mat-option [value]="opt">{{ opt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        <div class="filter-actions">
          @if (filterService.isActive()) {
            <button mat-stroked-button color="warn" (click)="filterService.reset()">
              <mat-icon>clear</mat-icon> Limpiar filtros
            </button>
          }
          <span class="filter-count">{{ filterService.filteredIncidents().length }} registros</span>
        </div>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styles: [`
    .filter-panel { margin-bottom: 16px; border-radius: 12px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important; }
    .filter-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; padding: 8px 0; }
    .filter-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
    .active-badge { font-size: 11px; background: #3B82F6; color: white; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
    .filter-count { font-size: 13px; color: #64748B; }
    mat-form-field { width: 100%; }
  `]
})
export class FilterPanel {
  constructor(public filterService: DmaicFilterService) {}
}
