import { Component, computed } from '@angular/core';
import { DmaicService } from '../../../core/services/dmaic.service';
import { DataTable, TableColumn } from '../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-tablas',
  imports: [DataTable],
  template: `
    <div class="tablas-container">
      <!-- 1. Resumen Ejecutivo -->
      <app-data-table [title]="'Resumen Ejecutivo'" [subtitle]="'Indicadores principales del proceso DMAIC'"
        [columns]="resumenColumns" [data]="resumenData()"
        [explicacion]="'Esta tabla resume los indicadores clave del proceso DMAIC. Permite evaluar rápidamente el estado actual de la calidad del proceso de detección y resolución de defectos.'" />

      <!-- 2. Detalle de Defectos -->
      <app-data-table [title]="'Detalle de Defectos'" [subtitle]="'Listado completo de incidencias'"
        [columns]="detalleColumns" [data]="detalleData()"
        [explicacion]="'Listado detallado de todos los defectos registrados. Incluye ID, módulo, severidad, estado, responsable y tiempo de resolución. Útil para análisis granular y seguimiento individual.'" />

      <!-- 3. Pareto -->
      <app-data-table [title]="'Análisis Pareto'" [subtitle]="'Distribución de tipos de defecto'"
        [columns]="paretoColumns" [data]="paretoData()"
        [explicacion]="'Tabla de análisis Pareto que ordena los tipos de defecto por frecuencia. Incluye el porcentaje individual y acumulado. Permite identificar el 80% de los problemas para enfocar las acciones de mejora.'" />

      <!-- 4. Tiempo de Resolución -->
      <app-data-table [title]="'Estadísticos de Tiempo de Resolución'" [subtitle]="'Media, mediana, moda y desviación'"
        [columns]="tiempoColumns" [data]="tiempoData()"
        [explicacion]="'Estadísticos descriptivos del tiempo de resolución. La media indica el promedio general, la mediana es menos sensible a valores extremos, la moda es el valor más frecuente y la desviación estándar mide la variabilidad del proceso.'" />

      <!-- 5. Defectos por Módulo -->
      <app-data-table [title]="'Defectos por Módulo'" [subtitle]="'Ranking de módulos con más incidencias'"
        [columns]="moduloColumns" [data]="moduloData()"
        [explicacion]="'Distribución de defectos agrupados por módulo del sistema. Incluye ranking para priorizar los módulos que requieren mayor atención y recursos de QA.'" />

      <!-- 6. Defectos por Responsable -->
      <app-data-table [title]="'Defectos por Responsable'" [subtitle]="'Carga de trabajo del equipo QA'"
        [columns]="responsableColumns" [data]="responsableData()"
        [explicacion]="'Muestra la distribución estimada de defectos por rol del equipo QA. Permite evaluar la carga de trabajo y detectar necesidades de capacitación o contratación.'" />

      <!-- 7. KPIs DMAIC -->
      <app-data-table [title]="'KPIs DMAIC'" [subtitle]="'Indicadores con meta y estado'"
        [columns]="kpiDmaicColumns" [data]="kpiDmaicData()"
        [explicacion]="'Tabla de indicadores clave del proceso DMAIC. Cada KPI incluye su valor actual, la meta establecida, el estado (verde/amarillo/rojo) y una interpretación del resultado.'" />

      <!-- 8. Comparativo Antes vs Después -->
      <app-data-table [title]="'Comparativo Antes vs Después'" [subtitle]="'Evolución de indicadores'"
        [columns]="comparativoColumns" [data]="comparativoData()"
        [explicacion]="'Compara los indicadores actuales contra una línea base anterior. La variación y el porcentaje de mejora permiten evaluar el impacto de las acciones correctivas implementadas.'" />
    </div>
  `,
  styles: [`
    .tablas-container { padding: 4px 0; }
  `]
})
export class Tablas {
  constructor(private dmaicService: DmaicService) {}

  resumenColumns: TableColumn[] = [
    { key: 'indicador', header: 'Indicador' },
    { key: 'valor', header: 'Valor' },
    { key: 'unidad', header: 'Unidad' },
    { key: 'descripcion', header: 'Descripción' },
  ];
  resumenData = computed(() => this.dmaicService.kpis().map(k => ({
    indicador: k.label, valor: k.value, unidad: k.unit, descripcion: k.description,
  })));

  detalleColumns: TableColumn[] = [
    { key: 'id', header: 'ID' },
    { key: 'modulo', header: 'Módulo' },
    { key: 'severidad', header: 'Severidad' },
    { key: 'estado', header: 'Estado' },
    { key: 'tipo', header: 'Tipo Defecto' },
    { key: 'metodo', header: 'Método' },
    { key: 'tiempo', header: 'Tiempo (h)' },
    { key: 'fecha', header: 'Fecha Detección' },
  ];
  detalleData = computed(() => this.dmaicService.rawData().map(d => ({
    id: d.ID, modulo: d.Modulo, severidad: d.Severidad, estado: d.Estado,
    tipo: d['Tipo Defecto'], metodo: d['Metodo Deteccion'],
    tiempo: d['Tiempo Resolucion (h)'], fecha: d['Fecha Deteccion'],
  })));

  paretoColumns: TableColumn[] = [
    { key: 'tipo', header: 'Tipo de Defecto' },
    { key: 'cantidad', header: 'Cantidad' },
    { key: 'pct', header: '% Individual' },
    { key: 'acumulado', header: '% Acumulado' },
  ];
  paretoData = computed(() => this.dmaicService.pareto().map(p => ({
    tipo: p.tipo, cantidad: p.cantidad, pct: p.pct.toFixed(2) + '%', acumulado: p.acumulado.toFixed(2) + '%',
  })));

  tiempoColumns: TableColumn[] = [
    { key: 'estadistico', header: 'Estadístico' },
    { key: 'valor', header: 'Valor (h)' },
    { key: 'interpretacion', header: 'Interpretación' },
  ];
  tiempoData = computed(() => {
    const e = this.dmaicService.tiemposEstadisticos();
    return [
      { estadistico: 'Media', valor: e.media.toFixed(2), interpretacion: 'Tiempo promedio de resolución' },
      { estadistico: 'Mediana', valor: e.mediana.toFixed(2), interpretacion: 'Valor central de los datos' },
      { estadistico: 'Moda', valor: e.moda.toFixed(2), interpretacion: 'Tiempo más frecuente' },
      { estadistico: 'Desviación Estándar', valor: e.desviacion.toFixed(2), interpretacion: 'Variabilidad del proceso' },
      { estadistico: 'Mínimo', valor: e.min.toFixed(2), interpretacion: 'Menor tiempo registrado' },
      { estadistico: 'Máximo', valor: e.max.toFixed(2), interpretacion: 'Mayor tiempo registrado' },
      { estadistico: 'Q1 (25%)', valor: e.q1.toFixed(2), interpretacion: 'Primer cuartil' },
      { estadistico: 'Q3 (75%)', valor: e.q3.toFixed(2), interpretacion: 'Tercer cuartil' },
    ];
  });

  moduloColumns: TableColumn[] = [
    { key: 'nombre', header: 'Módulo' },
    { key: 'cantidad', header: 'Cantidad' },
    { key: 'pct', header: '% del Total' },
    { key: 'ranking', header: 'Ranking' },
  ];
  moduloData = computed(() => this.dmaicService.moduloAgrupado()
    .sort((a, b) => b.value - a.value)
    .map((m, i) => ({ nombre: m.name, cantidad: m.value, pct: (m.pct ?? 0).toFixed(2) + '%', ranking: i + 1 })));

  responsableColumns: TableColumn[] = [
    { key: 'rol', header: 'Rol' },
    { key: 'cantidad', header: 'Defectos' },
    { key: 'tiempoProm', header: 'Tiempo Prom.' },
    { key: 'criticos', header: 'Críticos' },
    { key: 'resueltos', header: 'Resueltos' },
    { key: 'pendientes', header: 'Pendientes' },
  ];
  responsableData = computed(() => {
    const total = this.dmaicService.totalDefectos();
    const time = this.dmaicService.tiempoPromedio();
    const closed = this.dmaicService.defectosCerrados();
    const open = this.dmaicService.defectosPendientes();
    const crit = this.dmaicService.defectosCriticos();
    return this.dmaicService.responsableAgrupado().map(r => {
      const ratio = r.value / (total || 1);
      return {
        rol: r.name, cantidad: r.value,
        tiempoProm: Math.round(time * ratio) + 'h',
        criticos: Math.round(crit * ratio),
        resueltos: Math.round(closed * ratio),
        pendientes: Math.round(open * ratio),
      };
    });
  });

  kpiDmaicColumns: TableColumn[] = [
    { key: 'indicador', header: 'Indicador' },
    { key: 'valorActual', header: 'Valor Actual' },
    { key: 'meta', header: 'Meta' },
    { key: 'estado', header: 'Estado' },
    { key: 'interpretacion', header: 'Interpretación' },
  ];
  kpiDmaicData = computed(() => this.dmaicService.kpis().map(k => {
    const ok = k.metaDir === 'up' ? k.value >= k.meta : k.value <= k.meta;
    const warn = k.metaDir === 'up' ? k.value >= k.meta * 0.75 : k.value <= k.meta * 1.5;
    const estado = ok ? '🟢 Cumple' : warn ? '🟡 Atención' : '🔴 Fuera';
    return {
      indicador: k.label, valorActual: k.value + (k.unit ? ' ' + k.unit : ''),
      meta: k.meta + (k.unit ? ' ' + k.unit : ''), estado, interpretacion: k.description,
    };
  }));

  comparativoColumns: TableColumn[] = [
    { key: 'indicador', header: 'Indicador' },
    { key: 'antes', header: 'Antes' },
    { key: 'despues', header: 'Después' },
    { key: 'variacion', header: 'Variación' },
    { key: 'mejora', header: 'Mejora %' },
  ];
  comparativoData = computed(() => {
    const k = this.dmaicService.kpis();
    const antes = [85, 75000, 2.8, 36, 72, 0, 12, 60, 25, 70, 30, 35, 90];
    return k.map((kpi, i) => {
      const a = antes[i] || 0;
      const d = kpi.value;
      const variacion = d - a;
      const mejora = a ? Math.round(((d - a) / a) * 10000) / 100 : 0;
      return {
        indicador: kpi.label, antes: a + (kpi.unit ? ' ' + kpi.unit : ''),
        despues: d + (kpi.unit ? ' ' + kpi.unit : ''),
        variacion: (variacion > 0 ? '+' : '') + variacion.toFixed(1),
        mejora: (mejora > 0 ? '+' : '') + mejora.toFixed(1) + '%',
      };
    });
  });
}
