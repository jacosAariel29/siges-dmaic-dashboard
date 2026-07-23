import { Injectable, computed } from '@angular/core';
import { DmaicFilterService } from './dmaic-filter.service';

export interface KpiItem {
  label: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  previous?: number;
  description: string;
  meta: number;
  metaDir: 'up' | 'down';
}

export interface ParetoRow {
  tipo: string;
  cantidad: number;
  pct: number;
  acumulado: number;
}

export interface SimpleRow {
  name: string;
  value: number;
  pct?: number;
}

export interface MatrizRow {
  modulo: string;
  tipo: string;
  cantidad: number;
}

export interface ControlChartPoint {
  label: string;
  value: number;
  mean: number;
  ucl: number;
  lcl: number;
}

export interface ResumenEjecutivo {
  estado: string;
  nivelSigma: number;
  riesgos: string[];
  recomendacion: string;
}

@Injectable({ providedIn: 'root' })
export class DmaicService {
  readonly rawData = computed(() => this.filterService.filteredIncidents());
  private data = computed(() => this.filterService.filteredIncidents());
  private allData = computed(() => this.filterService.filterOptions);
  private readonly BASE_CASOS = 1500;

  constructor(private filterService: DmaicFilterService) {}

  private invNorm(p: number): number {
    if (p < 0.5) return -this.invNorm(1 - p);
    const c0 = 2.515517, c1 = 0.802853, c2 = 0.010328;
    const d1 = 1.432788, d2 = 0.189269, d3 = 0.001308;
    const t = Math.sqrt(-2 * Math.log(1 - p));
    const num = c0 + c1 * t + c2 * t * t;
    const den = 1 + d1 * t + d2 * t * t + d3 * t * t * t;
    return t - num / den;
  }

  private sigmaDesdeDpmo(dpmoVal: number): number {
    if (dpmoVal <= 0) return 6;
    const yieldVal = 1 - Math.min(0.9999, dpmoVal / 1000000);
    const z = this.invNorm(yieldVal);
    return Number((z + 1.5).toFixed(2));
  }

  private dpmoDesdeDefectos(defectos: number): number {
    return Math.round((defectos / this.BASE_CASOS) * 1000000);
  }

  private getTiempos = computed(() => this.data().map(d => Number(d['Tiempo Resolucion (h)']) || 0));
  private getCerrados = computed(() => this.data().filter(d => d['Es Cerrado'] === '1'));
  private getCriticos = computed(() => this.data().filter(d => d['Es Critico'] === '1'));
  private getPendientes = computed(() => this.data().filter(d => d.Estado === 'Pendiente'));

  readonly totalDefectos = computed(() => this.data().length);

  readonly dpmo = computed(() => this.dpmoDesdeDefectos(this.totalDefectos()));

  readonly nivelSigma = computed(() => this.sigmaDesdeDpmo(this.dpmo()));

  readonly tiempoPromedio = computed(() => {
    const t = this.getTiempos();
    return t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : 0;
  });

  readonly tiempoMax = computed(() => Math.max(...this.getTiempos(), 0));
  readonly tiempoMin = computed(() => Math.min(...this.getTiempos(), 0));

  readonly defectosCriticos = computed(() => this.getCriticos().length);
  readonly defectosCerrados = computed(() => this.getCerrados().length);
  readonly defectosPendientes = computed(() => this.getPendientes().length);

  readonly pctResueltos = computed(() => {
    const total = this.totalDefectos();
    return total ? Math.round((this.defectosCerrados() / total) * 100) : 0;
  });

  readonly pctPendientes = computed(() => {
    const total = this.totalDefectos();
    return total ? Math.round((this.defectosPendientes() / total) * 100) : 0;
  });

  readonly coberturaAutomatizacion = computed(() => {
    const total = this.data();
    const auto = total.filter(d => d['Metodo Deteccion'].toLowerCase().includes('automatizada'));
    return total.length ? Math.round((auto.length / total.length) * 100) : 0;
  });

  readonly casosEjecutados = computed(() => this.BASE_CASOS);

  readonly kpis = computed<KpiItem[]>(() => {
    const total = this.totalDefectos();
    return [
      { label: 'Total Defectos', value: total, unit: '', icon: 'bug_report', color: '#3B82F6', previous: total > 0 ? total - 1 : undefined, description: 'Total de defectos registrados en el período', meta: 0, metaDir: 'down' },
      { label: 'DPMO', value: this.dpmo(), unit: '', icon: 'analytics', color: '#8B5CF6', description: 'Defectos por millón de oportunidades', meta: 30000, metaDir: 'down' },
      { label: 'Nivel Sigma', value: this.nivelSigma(), unit: 'σ', icon: 'speed', color: '#10B981', description: 'Nivel de calidad del proceso (mayor es mejor)', meta: 3.5, metaDir: 'up' },
      { label: 'Tiempo Promedio', value: this.tiempoPromedio(), unit: 'h', icon: 'schedule', color: '#F59E0B', description: 'Tiempo promedio de resolución de defectos', meta: 24, metaDir: 'down' },
      { label: 'Tiempo Máximo', value: this.tiempoMax(), unit: 'h', icon: 'arrow_upward', color: '#EF4444', description: 'Tiempo máximo registrado para resolver un defecto', meta: 48, metaDir: 'down' },
      { label: 'Tiempo Mínimo', value: this.tiempoMin(), unit: 'h', icon: 'arrow_downward', color: '#10B981', description: 'Tiempo mínimo registrado para resolver un defecto', meta: 1, metaDir: 'down' },
      { label: 'Defectos Críticos', value: this.defectosCriticos(), unit: '', icon: 'report', color: '#EF4444', description: 'Defectos con severidad crítica que requieren atención inmediata', meta: 0, metaDir: 'down' },
      { label: 'Defectos Cerrados', value: this.defectosCerrados(), unit: '', icon: 'check_circle', color: '#10B981', description: 'Defectos que han sido resueltos y cerrados', meta: total, metaDir: 'up' },
      { label: 'Defectos Pendientes', value: this.defectosPendientes(), unit: '', icon: 'hourglass_empty', color: '#F59E0B', description: 'Defectos aún no resueltos', meta: 0, metaDir: 'down' },
      { label: '% Resueltos', value: this.pctResueltos(), unit: '%', icon: 'pie_chart', color: '#10B981', description: 'Porcentaje de defectos resueltos del total', meta: 80, metaDir: 'up' },
      { label: '% Pendientes', value: this.pctPendientes(), unit: '%', icon: 'pie_chart_outline', color: '#F59E0B', description: 'Porcentaje de defectos pendientes del total', meta: 20, metaDir: 'down' },
      { label: 'Cobertura Automatización', value: this.coberturaAutomatizacion(), unit: '%', icon: 'smart_toy', color: '#06B6D4', description: 'Porcentaje de defectos detectados mediante pruebas automatizadas', meta: 60, metaDir: 'up' },
      { label: 'Casos Ejecutados', value: this.casosEjecutados(), unit: '', icon: 'fact_check', color: '#3B82F6', description: 'Total de casos de prueba ejecutados en el período', meta: 0, metaDir: 'up' },
    ];
  });

  readonly pareto = computed<ParetoRow[]>(() => {
    const grouped = new Map<string, number>();
    for (const d of this.data()) {
      const t = d['Tipo Defecto'];
      grouped.set(t, (grouped.get(t) || 0) + 1);
    }
    const sorted = [...grouped.entries()].sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, c]) => s + c, 0);
    let acc = 0;
    return sorted.map(([tipo, cantidad]) => {
      acc += cantidad;
      return { tipo, cantidad, pct: Math.round((cantidad / total) * 10000) / 100, acumulado: Math.round((acc / total) * 10000) / 100 };
    });
  });

  readonly moduloAgrupado = computed<SimpleRow[]>(() => {
    const grouped = new Map<string, number>();
    for (const d of this.data()) {
      grouped.set(d.Modulo, (grouped.get(d.Modulo) || 0) + 1);
    }
    const total = this.totalDefectos();
    return [...grouped.entries()].map(([name, value]) => ({ name, value, pct: total ? Math.round((value / total) * 10000) / 100 : 0 }));
  });

  readonly estadoAgrupado = computed<SimpleRow[]>(() => {
    const order = ['Pendiente', 'En Proceso', 'Cerrado'];
    const grouped = new Map<string, number>();
    for (const d of this.data()) {
      grouped.set(d.Estado, (grouped.get(d.Estado) || 0) + 1);
    }
    return order.map(name => ({ name, value: grouped.get(name) || 0 }));
  });

  readonly severidadAgrupado = computed<SimpleRow[]>(() => {
    const order = ['Crítica', 'Alta', 'Media', 'Baja'];
    const grouped = new Map<string, number>();
    for (const d of this.data()) {
      grouped.set(d.Severidad, (grouped.get(d.Severidad) || 0) + 1);
    }
    return order.map(name => ({ name, value: grouped.get(name) || 0 }));
  });

  readonly metodoAgrupado = computed<SimpleRow[]>(() => {
    const grouped = new Map<string, number>();
    for (const d of this.data()) {
      grouped.set(d['Metodo Deteccion'], (grouped.get(d['Metodo Deteccion']) || 0) + 1);
    }
    return [...grouped.entries()].map(([name, value]) => ({ name, value }));
  });

  readonly evolucionMensual = computed<SimpleRow[]>(() => {
    const grouped = new Map<string, number>();
    for (const d of this.data()) {
      const key = d['Año-Mes'];
      grouped.set(key, (grouped.get(key) || 0) + 1);
    }
    return [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, value]) => ({ name, value }));
  });

  readonly evolucionSigma = computed<SimpleRow[]>(() => {
    const months = [...new Set(this.data().map(d => d['Año-Mes']))].sort();
    const numMeses = months.length || 1;
    const casosPorMes = this.BASE_CASOS / numMeses;
    const grouped = new Map<string, number>();
    for (const d of this.data()) {
      const key = d['Año-Mes'];
      grouped.set(key, (grouped.get(key) || 0) + 1);
    }
    return months.map(name => {
      const total = grouped.get(name) || 0;
      const dpmoVal = Math.round((total / casosPorMes) * 1000000);
      const sigma = this.sigmaDesdeDpmo(dpmoVal);
      return { name, value: sigma };
    });
  });

  readonly evolucionDpmo = computed<SimpleRow[]>(() => {
    const months = [...new Set(this.data().map(d => d['Año-Mes']))].sort();
    const numMeses = months.length || 1;
    const casosPorMes = this.BASE_CASOS / numMeses;
    const grouped = new Map<string, number>();
    for (const d of this.data()) {
      const key = d['Año-Mes'];
      grouped.set(key, (grouped.get(key) || 0) + 1);
    }
    return months.map(name => {
      const total = grouped.get(name) || 0;
      const dpmoVal = Math.round((total / casosPorMes) * 1000000);
      return { name, value: dpmoVal };
    });
  });

  readonly histogramaTiempos = computed<SimpleRow[]>(() => {
    const bins = ['0-6', '7-12', '13-18', '19-24', '25-36', '37-48', '49-72', '73+'];
    const counts = new Array(bins.length).fill(0);
    for (const d of this.data()) {
      const t = Number(d['Tiempo Resolucion (h)']) || 0;
      if (t <= 6) counts[0]++;
      else if (t <= 12) counts[1]++;
      else if (t <= 18) counts[2]++;
      else if (t <= 24) counts[3]++;
      else if (t <= 36) counts[4]++;
      else if (t <= 48) counts[5]++;
      else if (t <= 72) counts[6]++;
      else counts[7]++;
    }
    return bins.map((name, i) => ({ name, value: counts[i] }));
  });

  readonly matrizModuloSeveridad = computed<MatrizRow[]>(() => {
    const result: MatrizRow[] = [];
    const modulos = [...new Set(this.data().map(d => d.Modulo))].sort();
    const severidades = ['Crítica', 'Alta', 'Media', 'Baja'];
    for (const m of modulos) {
      for (const s of severidades) {
        const cantidad = this.data().filter(d => d.Modulo === m && d.Severidad === s).length;
        if (cantidad > 0) result.push({ modulo: m, tipo: s, cantidad });
      }
    }
    return result;
  });

  readonly responsableAgrupado = computed<SimpleRow[]>(() => {
    const asignacion = ['QA Lead', 'QA Senior', 'QA Junior', 'QA Automation', 'QA Manual'];
    const total = this.totalDefectos();
    return asignacion.map((name, i) => {
      const base = Math.floor(total / asignacion.length);
      const extra = i < total % asignacion.length ? 1 : 0;
      return { name, value: base + extra };
    });
  });

  readonly tiemposEstadisticos = computed(() => {
    const t = this.getTiempos().sort((a, b) => a - b);
    const n = t.length;
    if (!n) return { media: 0, mediana: 0, moda: 0, desviacion: 0, min: 0, max: 0, q1: 0, q3: 0 };
    const media = t.reduce((a, b) => a + b, 0) / n;
    const mediana = n % 2 === 0 ? (t[n / 2 - 1] + t[n / 2]) / 2 : t[Math.floor(n / 2)];
    const freq = new Map<number, number>();
    t.forEach(v => freq.set(v, (freq.get(v) || 0) + 1));
    let moda = t[0];
    let maxFreq = 0;
    for (const [v, f] of freq) { if (f > maxFreq) { maxFreq = f; moda = v; } }
    const desviacion = Math.sqrt(t.reduce((s, v) => s + (v - media) ** 2, 0) / n);
    const q1 = t[Math.floor(n * 0.25)];
    const q3 = t[Math.floor(n * 0.75)];
    return { media: Math.round(media * 100) / 100, mediana, moda, desviacion: Math.round(desviacion * 100) / 100, min: t[0], max: t[n - 1], q1, q3 };
  });

  readonly controlChart = computed<ControlChartPoint[]>(() => {
    const t = this.getTiempos();
    const n = t.length;
    if (!n) return [];
    const mean = t.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(t.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
    const ucl = mean + 3 * std;
    const lcl = Math.max(0, mean - 3 * std);
    return this.data().map((d, i) => ({
      label: `#${d.ID}`,
      value: Number(d['Tiempo Resolucion (h)']) || 0,
      mean: Math.round(mean * 100) / 100,
      ucl: Math.round(ucl * 100) / 100,
      lcl: Math.round(lcl * 100) / 100,
    }));
  });

  readonly resumenEjecutivo = computed<ResumenEjecutivo>(() => {
    const sigma = this.nivelSigma();
    const pctCerrado = this.pctResueltos();
    const total = this.totalDefectos();
    const criticos = this.defectosCriticos();
    const promedio = this.tiempoPromedio();

    let estado: string;
    if (sigma >= 3.5) estado = 'El proceso ha alcanzado la meta de calidad. Se recomienda mantener y mejorar continuamente.';
    else if (sigma >= 2.5) estado = 'El proceso requiere mejoras significativas para alcanzar la meta de 3.5σ.';
    else estado = 'El proceso está por debajo de los estándares aceptables. Se requiere intervención urgente.';

    const riesgos: string[] = [];
    if (criticos > 0) riesgos.push(`${criticos} defectos críticos requieren atención inmediata.`);
    if (pctCerrado < 80) riesgos.push(`Solo el ${pctCerrado}% de los defectos han sido cerrados.`);
    if (promedio > 24) riesgos.push(`El tiempo promedio de resolución (${promedio}h) supera las 24 horas.`);

    let recomendacion: string;
    if (sigma < 2.5) recomendacion = 'Implementar un plan de acción correctiva inmediato. Priorizar la reducción de defectos críticos y establecer metas semanales de cierre.';
    else if (sigma < 3.5) recomendacion = 'Fortalecer las pruebas automatizadas y reducir el tiempo de resolución. Enfocar esfuerzos en los módulos con mayor concentración de defectos para alcanzar la meta de 3.5σ.';
    else recomendacion = 'Mantener el estándar actual y documentar las mejores prácticas. Implementar mejora continua en los procesos de QA.';

    return { estado, nivelSigma: sigma, riesgos, recomendacion };
  });
}
