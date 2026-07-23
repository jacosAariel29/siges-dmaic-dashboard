import { Component, computed } from '@angular/core';
import { Chart, registerables, ChartConfiguration, ChartType, Plugin } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DmaicService } from '../../../core/services/dmaic.service';
import { ChartCard } from '../../../shared/components/chart-card/chart-card';
import { GaugeChart } from '../../../shared/components/gauge-chart/gauge-chart';

Chart.register(...registerables);

function pos(p: string): 'top' | 'right' | 'left' | 'bottom' | 'center' | 'chartArea' {
  return p as any;
}

@Component({
  selector: 'app-graficos',
  imports: [BaseChartDirective, ChartCard, GaugeChart],
  template: `
    <div class="charts-grid">
      <app-chart-card title="Pareto de Defectos" subtitle="Distribución de tipos de defecto"
        interpretacion="Este gráfico muestra los tipos de defectos ordenados por frecuencia. La línea representa el porcentaje acumulado. Identifica qué pocos tipos de defectos causan la mayoría de los problemas (Principio 80/20)."
        conclusion="Los primeros tipos de defecto concentran gran parte del total de incidencias."
        recomendacion="Enfocar los esfuerzos de mejora en los tipos de defecto que acumulan el 80% de los casos.">
        <canvas baseChart type="bar" [data]="paretoData()" [options]="paretoOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Defectos por Módulo" subtitle="Incidencias agrupadas por módulo"
        interpretacion="Muestra qué módulos del sistema concentran la mayor cantidad de defectos. Permite priorizar los módulos que requieren intervención."
        conclusion="Los módulos con mayor número de defectos deben ser priorizados para acciones correctivas."
        recomendacion="Asignar recursos de QA adicionales a los módulos con mayor concentración de defectos.">
        <canvas baseChart type="bar" [data]="moduloData()" [options]="moduloOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Estado de Defectos" subtitle="Distribución por estado actual"
        interpretacion="Muestra la proporción de defectos en cada estado: Pendientes, En Proceso y Cerrados. Indica el avance del equipo de QA en la resolución."
        conclusion="Un alto porcentaje de defectos cerrados indica buena eficiencia del equipo."
        recomendacion="Establecer metas semanales de cierre para reducir los defectos pendientes.">
        <canvas baseChart type="doughnut" [data]="estadoData()" [options]="doughnutOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Defectos por Severidad" subtitle="Distribución por nivel de severidad"
        interpretacion="Clasifica los defectos según su severidad: Crítica, Alta, Media y Baja. Los defectos críticos representan el mayor riesgo operativo."
        conclusion="La presencia de defectos críticos requiere atención inmediata del equipo."
        recomendacion="Priorizar la resolución de defectos críticos y altos antes que los de menor severidad.">
        <canvas baseChart type="bar" [data]="severidadData()" [options]="severidadOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Histograma de Tiempo de Resolución" subtitle="Distribución de frecuencias de tiempos"
        interpretacion="Muestra cómo se distribuyen los tiempos de resolución en diferentes rangos. Permite identificar la concentración de casos y la variabilidad del proceso."
        conclusion="La forma de la distribución indica la consistencia del proceso de resolución."
        recomendacion="Reducir la dispersión de los tiempos estandarizando el proceso de atención.">
        <canvas baseChart type="bar" [data]="histogramaData()" [options]="histogramaOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Box Plot - Tiempo de Resolución" subtitle="Estadísticos de tiempo"
        interpretacion="Resume la distribución del tiempo de resolución mostrando mínimo, Q1, mediana, Q3 y máximo. Los outliers son casos que se desvían significativamente."
        conclusion="La mediana y el rango intercuartil indican la tendencia central y la dispersión típica."
        recomendacion="Investigar los casos outlier para identificar causas raíz de demoras extremas.">
        <canvas baseChart type="bar" [data]="boxPlotData()" [options]="boxPlotOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Tendencia Temporal de Defectos" subtitle="Evolución por mes"
        interpretacion="Muestra la evolución del número de defectos a lo largo del tiempo. Permite identificar si el proceso está mejorando o empeorando."
        conclusion="Una tendencia decreciente indica mejora continua; una creciente requiere acción."
        recomendacion="Monitorear la tendencia mensual y establecer alertas cuando supere umbrales.">
        <canvas baseChart type="line" [data]="evolucionData()" [options]="lineOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Tendencia del Nivel Sigma" subtitle="Evolución de la calidad del proceso"
        interpretacion="El nivel Sigma mide la capacidad del proceso. Valores más altos indican mejor calidad. La tendencia muestra si las mejoras están funcionando."
        conclusion="Un Sigma creciente indica madurez del proceso y reducción de defectos."
        recomendacion="Mantener las iniciativas de mejora y documentar las prácticas que elevan el Sigma.">
        <canvas baseChart type="line" [data]="sigmaTrendData()" [options]="lineOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Tendencia del DPMO" subtitle="Evolución de defectos por millón"
        interpretacion="El DPMO cuantifica los defectos por millón de oportunidades. Una tendencia decreciente indica reducción efectiva de defectos."
        conclusion="La reducción del DPMO confirma la efectividad de las acciones correctivas."
        recomendacion="Continuar con las estrategias que han demostrado reducir el DPMO.">
        <canvas baseChart type="line" [data]="dpmoTrendData()" [options]="lineOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Defectos por Responsable" subtitle="Carga de trabajo del equipo QA"
        interpretacion="Muestra la distribución de defectos asignados a cada rol del equipo QA. Permite evaluar la carga de trabajo y necesidades de capacitación."
        conclusion="Una distribución desigual puede indicar sobrecarga en ciertos roles."
        recomendacion="Balancear la asignación de defectos y considerar capacitación adicional donde sea necesario.">
        <canvas baseChart type="bar" [data]="responsableData()" [options]="responsableOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Heatmap: Módulo vs Tipo de Defecto" subtitle="Concentración de incidencias"
        interpretacion="Este heatmap muestra dónde se concentran los tipos de defecto por módulo. Las celdas más oscuras indican mayor concentración de incidencias."
        conclusion="Identifica los puntos críticos donde confluyen módulos problemáticos con tipos de defecto frecuentes."
        recomendacion="Intervenir en las celdas de alta concentración con acciones correctivas específicas.">
        <canvas baseChart type="bar" [data]="heatmapData()" [options]="heatmapOptions" style="height: 400px"></canvas>
      </app-chart-card>

      <app-chart-card title="Scatter: Tiempo vs Severidad" subtitle="Relación entre severidad y tiempo de resolución"
        interpretacion="Cada punto representa un defecto. Muestra si los defectos críticos tienden a resolverse más rápido o más lento que los de menor severidad."
        conclusion="Si los críticos tardan más, puede indicar complejidad en su resolución o falta de priorización."
        recomendacion="Establecer SLA diferenciados por severidad para garantizar tiempos adecuados.">
        <canvas baseChart type="scatter" [data]="scatterData()" [options]="scatterOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Radar: Comparativo Antes vs Después" subtitle="Evaluación multidimensional"
        interpretacion="Compara métricas clave antes y después de las mejoras. Evalúa calidad, tiempo, cobertura, automatización y satisfacción."
        conclusion="Un radar más expansivo en 'Después' indica mejora integral del proceso."
        recomendacion="Utilizar este radar para comunicar el impacto de las mejoras a stakeholders.">
        <canvas baseChart type="radar" [data]="radarData()" [options]="radarOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Funnel de Resolución" subtitle="Embudo del flujo de atención"
        interpretacion="Muestra la progresión de defectos a través de las etapas: Pendiente → En Proceso → Cerrado. Las reducciones indican cuellos de botella."
        conclusion="Una gran caída entre Pendiente y Cerrado indica demora en la resolución."
        recomendacion="Identificar y eliminar los cuellos de botella en el flujo de atención.">
        <canvas baseChart type="bar" [data]="funnelData()" [options]="funnelOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Carta de Control (Control Chart)" subtitle="Estabilidad del proceso"
        interpretacion="Muestra cada defecto con su tiempo de resolución, la media general, y los límites superior e inferior de control (3σ). Puntos fuera de los límites indican causas especiales."
        conclusion="Si la mayoría de puntos están dentro de los límites, el proceso está bajo control estadístico."
        recomendacion="Investigar los puntos fuera de control para identificar causas especiales y eliminarlas.">
        <canvas baseChart type="line" [data]="controlChartData()" [options]="controlChartOptions" style="height: 300px"></canvas>
      </app-chart-card>

      <app-chart-card title="Gauge Charts" subtitle="Indicadores visuales tipo semáforo"
        interpretacion="Cada gauge muestra el valor actual de un KPI clave frente a su meta. El color indica si se cumple (verde), está cerca (amarillo) o fuera (rojo) de la meta."
        conclusion="Los gauges dan una visión rápida del estado de los principales indicadores."
        recomendacion="Monitorear los gauges periódicamente para detectar desviaciones tempranas.">
        <div class="gauge-row">
          @for (g of gauges(); track g.label) {
            <app-gauge-chart [label]="g.label" [value]="g.value" [unit]="g.unit" [meta]="g.meta" [metaDir]="g.metaDir" />
          }
        </div>
      </app-chart-card>
    </div>
  `,
  styles: [`
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .gauge-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
    @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }
  `]
})
export class Graficos {
  constructor(public dmaicService: DmaicService) {}

  readonly chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];

  readonly paretoData = computed<ChartConfiguration<'bar' | 'line'>['data']>(() => {
    const p = this.dmaicService.pareto();
    return { labels: p.map(x => x.tipo), datasets: [
      { data: p.map(x => x.cantidad), label: 'Cantidad', backgroundColor: '#3B82F6', borderRadius: 4 },
      { data: p.map(x => x.acumulado), label: '% Acumulado', type: 'line', borderColor: '#EF4444', backgroundColor: '#EF4444', yAxisID: 'y1', tension: 0.3, fill: false, pointBackgroundColor: '#EF4444', pointRadius: 4 },
    ]};
  });
  readonly paretoOptions: ChartConfiguration<'bar' | 'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' } },
    scales: { y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } }, y1: { position: 'right', min: 0, max: 100, title: { display: true, text: '% Acumulado' }, grid: { drawOnChartArea: false } } }
  };

  readonly moduloData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const m = this.dmaicService.moduloAgrupado().sort((a, b) => b.value - a.value);
    return { labels: m.map(x => x.name), datasets: [{ data: m.map(x => x.value), label: 'Defectos', backgroundColor: this.chartColors, borderRadius: 4 }] };
  });
  readonly moduloOptions: ChartConfiguration<'bar'>['options'] = { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } };

  readonly estadoData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const e = this.dmaicService.estadoAgrupado();
    return { labels: e.map(x => x.name), datasets: [{ data: e.map(x => x.value), backgroundColor: ['#F59E0B', '#3B82F6', '#10B981'], borderWidth: 0 }] };
  });
  readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  readonly severidadData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const s = this.dmaicService.severidadAgrupado();
    return { labels: s.map(x => x.name), datasets: [{ data: s.map(x => x.value), label: 'Defectos', backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'], borderRadius: 4 }] };
  });
  readonly severidadOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };

  readonly histogramaData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const h = this.dmaicService.histogramaTiempos();
    return { labels: h.map(x => x.name + 'h'), datasets: [{ data: h.map(x => x.value), label: 'Frecuencia', backgroundColor: '#8B5CF6', borderRadius: 4 }] };
  });
  readonly histogramaOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };

  readonly boxPlotData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const e = this.dmaicService.tiemposEstadisticos();
    return { labels: ['Tiempo (h)'], datasets: [
      { data: [e.min], label: 'Mínimo', backgroundColor: '#10B981', borderRadius: 4 },
      { data: [e.q1], label: 'Q1', backgroundColor: '#3B82F6', borderRadius: 4 },
      { data: [e.mediana], label: 'Mediana', backgroundColor: '#F59E0B', borderRadius: 4 },
      { data: [e.q3], label: 'Q3', backgroundColor: '#8B5CF6', borderRadius: 4 },
      { data: [e.max], label: 'Máximo', backgroundColor: '#EF4444', borderRadius: 4 },
    ]};
  });
  readonly boxPlotOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Horas' } } } };

  readonly evolucionData = computed<ChartConfiguration<'line'>['data']>(() => {
    const ev = this.dmaicService.evolucionMensual();
    return { labels: ev.map(x => x.name), datasets: [{ data: ev.map(x => x.value), label: 'Defectos', borderColor: '#3B82F6', backgroundColor: '#3B82F618', fill: true, tension: 0.4, pointBackgroundColor: '#3B82F6' }] };
  });
  readonly lineOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' } }, scales: { y: { beginAtZero: true } } };

  readonly sigmaTrendData = computed<ChartConfiguration<'line'>['data']>(() => {
    const s = this.dmaicService.evolucionSigma();
    return { labels: s.map(x => x.name), datasets: [{ data: s.map(x => x.value), label: 'Nivel Sigma', borderColor: '#10B981', backgroundColor: '#10B98118', fill: true, tension: 0.4 }] };
  });

  readonly dpmoTrendData = computed<ChartConfiguration<'line'>['data']>(() => {
    const d = this.dmaicService.evolucionDpmo();
    return { labels: d.map(x => x.name), datasets: [{ data: d.map(x => x.value), label: 'DPMO', borderColor: '#F59E0B', backgroundColor: '#F59E0B18', fill: true, tension: 0.4 }] };
  });

  readonly responsableData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const r = this.dmaicService.responsableAgrupado();
    return { labels: r.map(x => x.name), datasets: [{ data: r.map(x => x.value), label: 'Defectos', backgroundColor: '#06B6D4', borderRadius: 4 }] };
  });
  readonly responsableOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };

  readonly heatmapData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const m = this.dmaicService.matrizModuloSeveridad();
    const modulos = [...new Set(m.map(x => x.modulo))].sort();
    const tipos = [...new Set(m.map(x => x.tipo))];
    return { labels: modulos, datasets: tipos.map((t, i) => ({ data: modulos.map(mod => m.find(x => x.modulo === mod && x.tipo === t)?.cantidad || 0), label: t, backgroundColor: this.chartColors[i % this.chartColors.length], borderRadius: 2 })) };
  });
  readonly heatmapOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } };

  readonly scatterData = computed<ChartConfiguration<'scatter'>['data']>(() => {
    const severidadMap: Record<string, number> = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
    const points = this.dmaicService.rawData().map(d => ({ x: severidadMap[d.Severidad] || 0, y: Number(d['Tiempo Resolucion (h)']) || 0 }));
    return { datasets: [{ data: points, label: 'Defectos', backgroundColor: '#8B5CF6', pointRadius: 5 }] };
  });
  readonly scatterOptions: ChartConfiguration<'scatter'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Severidad (1=Baja, 4=Crítica)' }, min: 0, max: 5 }, y: { beginAtZero: true, title: { display: true, text: 'Tiempo (h)' } } } };

  readonly radarData = computed<ChartConfiguration<'radar'>['data']>(() => {
    const antes = [2.5, 30, 45, 20, 3];
    const despues = [this.dmaicService.nivelSigma(), Math.max(5, 30 - this.dmaicService.tiempoPromedio()), this.dmaicService.coberturaAutomatizacion(), this.dmaicService.pctResueltos(), 4];
    return { labels: ['Calidad (σ)', 'Tiempo (eficiencia)', 'Cobertura (%)', 'Autom. (%)', 'Satisfacción'], datasets: [
      { data: antes, label: 'Antes', borderColor: '#94A3B8', backgroundColor: '#94A3B818', pointBackgroundColor: '#94A3B8', fill: true },
      { data: despues, label: 'Después', borderColor: '#10B981', backgroundColor: '#10B98118', pointBackgroundColor: '#10B981', fill: true },
    ]};
  });
  readonly radarOptions: ChartConfiguration<'radar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { r: { beginAtZero: true, max: 100 } } };

  readonly funnelData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const e = this.dmaicService.estadoAgrupado();
    const pendiente = e.find(x => x.name === 'Pendiente')?.value || 0;
    const proceso = e.find(x => x.name === 'En Proceso')?.value || 0;
    const cerrado = e.find(x => x.name === 'Cerrado')?.value || 0;
    return { labels: ['Pendiente', 'En Proceso', 'Cerrado'], datasets: [{ data: [pendiente, proceso, cerrado], label: 'Defectos', backgroundColor: ['#F59E0B', '#3B82F6', '#10B981'], borderRadius: 4 }] };
  });
  readonly funnelOptions: ChartConfiguration<'bar'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };

  readonly controlChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const c = this.dmaicService.controlChart();
    const labels = c.map(x => x.label);
    return { labels, datasets: [
      { data: c.map(x => x.value), label: 'Tiempo (h)', borderColor: '#3B82F6', backgroundColor: '#3B82F6', pointRadius: 3, tension: 0 },
      { data: c.map(x => x.mean), label: 'Media', borderColor: '#10B981', borderDash: [5, 5] as any, pointRadius: 0, pointHitRadius: 0 },
      { data: c.map(x => x.ucl), label: 'LCS (3σ)', borderColor: '#EF4444', borderDash: [3, 3] as any, pointRadius: 0, pointHitRadius: 0 },
      { data: c.map(x => x.lcl), label: 'LCI (3σ)', borderColor: '#EF4444', borderDash: [3, 3] as any, pointRadius: 0, pointHitRadius: 0 },
    ]};
  });
  readonly controlChartOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Tiempo (h)' } } } };

  readonly gauges = computed(() => {
    return [
      { label: 'Sigma', value: this.dmaicService.nivelSigma(), unit: 'σ', meta: 4, metaDir: 'up' as const },
      { label: 'DPMO', value: this.dmaicService.dpmo(), unit: '', meta: 50000, metaDir: 'down' as const },
      { label: 'Tiempo Prom', value: this.dmaicService.tiempoPromedio(), unit: 'h', meta: 24, metaDir: 'down' as const },
      { label: 'Autom.', value: this.dmaicService.coberturaAutomatizacion(), unit: '%', meta: 60, metaDir: 'up' as const },
      { label: '% Resueltos', value: this.dmaicService.pctResueltos(), unit: '%', meta: 80, metaDir: 'up' as const },
    ];
  });
}
