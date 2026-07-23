import { Component, input, computed, viewChild, effect, signal } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  header: string;
}

@Component({
  selector: 'app-data-table',
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, MatCardModule, FormsModule],
  template: `
    <mat-card class="table-card">
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
        @if (subtitle()) {
          <mat-card-subtitle>{{ subtitle() }}</mat-card-subtitle>
        }
      </mat-card-header>
      <mat-card-content>
        <div class="table-toolbar">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
            <mat-label>Buscar</mat-label>
            <input matInput [(ngModel)]="searchText" (input)="applyFilter()" placeholder="Buscar en tabla...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <button mat-stroked-button (click)="exportCsv()">
            <mat-icon>download</mat-icon> Exportar CSV
          </button>
        </div>
        <div class="table-wrapper">
          <table mat-table [dataSource]="dataSource" matSort class="full-width">
            @for (col of columns(); track col.key) {
              <ng-container [matColumnDef]="col.key">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ col.header }}</th>
                <td mat-cell *matCellDef="let row">{{ row[col.key] }}</td>
              </ng-container>
            }
            <tr mat-header-row *matHeaderRowDef="colKeys()"></tr>
            <tr mat-row *matRowDef="let row; columns: colKeys();"></tr>
          </table>
        </div>
        <mat-paginator [pageSizeOptions]="[5, 10, 20, 50]" [pageSize]="10" showFirstLastButtons></mat-paginator>
        @if (explicacion()) {
          <div class="table-explicacion">
            <strong>Acerca de esta tabla:</strong>
            <p>{{ explicacion() }}</p>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .table-card { margin-bottom: 20px; border-radius: 12px; }
    .table-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 12px 0; }
    .search-field { width: 300px; }
    .table-wrapper { overflow-x: auto; }
    .full-width { width: 100%; }
    .table-explicacion { margin-top: 16px; padding: 12px; background: #F8FAFC; border-radius: 8px; font-size: 13px; color: #64748B; }
    .table-explicacion strong { display: block; margin-bottom: 4px; color: #475569; }
    .table-explicacion p { margin: 0; line-height: 1.6; }
    mat-card-header { padding-bottom: 0; }
  `]
})
export class DataTable {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly explicacion = input('');
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<Record<string, any>[]>();

  readonly colKeys = computed(() => this.columns().map(c => c.key));
  dataSource = new MatTableDataSource<Record<string, any>>([]);
  searchText = '';

  private paginator = viewChild.required(MatPaginator);
  private sort = viewChild.required(MatSort);

  private paginatorReady = false;

  constructor() {
    effect(() => {
      const d = this.data();
      this.dataSource.data = d;
      if (this.paginatorReady && this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
    effect(() => {
      const p = this.paginator();
      const s = this.sort();
      if (p && s) {
        this.dataSource.paginator = p;
        this.dataSource.sort = s;
        this.paginatorReady = true;
      }
    });
  }

  applyFilter() {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
  }

  exportCsv() {
    const cols = this.columns();
    const rows = this.data();
    const header = cols.map(c => c.header).join(',');
    const csvRows = rows.map(r => cols.map(c => `"${(r[c.key] ?? '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [header, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${this.title().replace(/\s+/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
