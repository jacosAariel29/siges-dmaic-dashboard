import { Component, computed, signal } from '@angular/core';
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
        <button header-action class="interp-btn" (click)="toggleInterp()">{{ showInterp() ? '✕' : '📋' }} Interpretación</button>
        <canvas baseChart type="bar" [data]="paretoData()" [options]="paretoOptions" style="height: 300px"></canvas>
      </app-chart-card>
      @if (showInterp()) {
        <div class="interp-backdrop" (click)="showInterp.set(false)"></div>
        <div class="interp-overlay">
          <div class="interp-head">
            <strong>Pareto de Defectos — Interpretación</strong>
            <button class="interp-close" (click)="showInterp.set(false)">✕</button>
          </div>
          <div class="interp-split">
            <div class="interp-chart">
              <canvas baseChart type="bar" [data]="paretoData()" [options]="paretoModalOptions" style="height: 280px; width: 100%"></canvas>
            </div>
            <div class="interp-body">
              <p>El diagrama de Pareto revela que los <strong>tres primeros tipos de defecto</strong> concentran el <strong>67.8%</strong> del total de incidencias:</p>
              <ol>
                <li><strong>Validación de datos</strong> (28.9%) — caracteres inválidos en formularios críticos</li>
                <li><strong>Fallo en botones interactivos</strong> (22.2%) — Editar/Dar de baja no responden</li>
                <li><strong>Falsa alerta de campos obligatorios</strong> (16.7%) — validaciones incorrectas</li>
              </ol>
              <p>Agregando <strong>"Uso de registros dados de baja"</strong> (11.1%) se alcanza el <strong>78.9%</strong>, cumpliendo el principio 80/20.</p>
              <hr>
              <p><strong>Causa raíz:</strong> Debilidad en las reglas de validación del sistema (front-end y servidor), combinada con cobertura insuficiente de pruebas automatizadas y falta de filtros para registros inactivos.</p>
              <p><strong>Recomendación:</strong> Implementar validaciones estrictas con expresiones regulares, crear checklist de humo para botones, refactorizar la lógica de formularios y aplicar filtros SQL para excluir registros dados de baja. Con estas acciones se estima reducir los defectos en al menos un 60%.</p>
            </div>
          </div>
        </div>
      }

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
        <button header-action class="interp-btn" (click)="toggleBoxInterp()">{{ showBoxInterp() ? '✕' : '📋' }} Interpretación</button>
        <canvas baseChart type="bar" [data]="boxPlotData()" [options]="boxPlotOptions" style="height: 300px"></canvas>
      </app-chart-card>
      @if (showBoxInterp()) {
        <div class="interp-backdrop" (click)="showBoxInterp.set(false)"></div>
        <div class="interp-overlay">
          <div class="interp-head">
            <strong>Box Plot — Interpretación</strong>
            <button class="interp-close" (click)="showBoxInterp.set(false)">✕</button>
          </div>
          <div class="interp-split">
            <div class="interp-chart">
              <canvas baseChart type="bar" [data]="boxPlotData()" [options]="boxModalOptions" style="height: 280px"></canvas>
            </div>
            <div class="interp-body">
              <p>El Box Plot resume la distribución del tiempo de resolución de los <strong>180 defectos</strong> registrados durante el ciclo de pruebas de SIGES 3.0:</p>
              <ul>
                <li><strong>Mínimo:</strong> 1 h — casos simples resueltos rápidamente</li>
                <li><strong>Máximo:</strong> 61 h — demora extrema que requiere investigación</li>
                <li><strong>Media:</strong> 17.8 h — supera la meta de 8 h establecida en el plan de mejora</li>
              </ul>
              <p>La diferencia entre Q1 y Q3 (rango intercuartil) representa la <strong>variabilidad típica</strong> del proceso de resolución. Una amplitud elevada indica que no existe un proceso estandarizado de atención.</p>
              <hr>
              <p><strong>Interpretación:</strong> El tiempo promedio de 17.8 h duplica la meta de 8 h. La presencia de valores extremos (61 h) sugiere causas especiales —posiblemente defectos complejos o falta de priorización— que deben identificarse y eliminarse para estabilizar el proceso.</p>
              <p><strong>Recomendación:</strong> Establecer SLA por severidad (críticos &lt; 4 h, altos &lt; 8 h, medios &lt; 24 h), implementar un sistema de escalamiento automático y monitorizar semanalmente los tiempos mediante la carta de control.</p>
            </div>
          </div>
        </div>
      }

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
        <button header-action class="interp-btn" (click)="toggleHeatmapInterp()">{{ showHeatmapInterp() ? '✕' : '📋' }} Interpretación</button>
        <canvas baseChart type="bar" [data]="heatmapData()" [options]="heatmapOptions" style="height: 400px"></canvas>
      </app-chart-card>
      @if (showHeatmapInterp()) {
        <div class="interp-backdrop" (click)="showHeatmapInterp.set(false)"></div>
        <div class="interp-overlay">
          <div class="interp-head">
            <strong>Heatmap — Interpretación</strong>
            <button class="interp-close" (click)="showHeatmapInterp.set(false)">✕</button>
          </div>
          <div class="interp-split">
            <div class="interp-chart">
              <canvas baseChart type="bar" [data]="heatmapData()" [options]="heatmapModalOptions" style="height: 280px; width: 100%"></canvas>
            </div>
            <div class="interp-body">
              <p>El heatmap cruza <strong>módulos del sistema</strong> (eje X) con <strong>tipos de defecto</strong> (series apiladas) para revelar dónde se concentran las incidencias. Las áreas más altas indican las combinaciones más problemáticas.</p>
              <p><strong>Hallazgos principales:</strong></p>
              <ul>
                <li><strong>Gestión de Pagos + Validación de datos:</strong> 10 defectos — la celda más crítica del sistema. Sugiere debilidades en las reglas de negocio financieras.</li>
                <li><strong>Gestión de Pagos + Fallo en botones interactivos:</strong> 8 defectos — problemas de usabilidad en el flujo de cobros.</li>
                <li><strong>Registro de Socios + Validación de datos:</strong> 7 defectos — errores en la captura de datos maestros.</li>
              </ul>
              <hr>
              <p><strong>Interpretación:</strong> El módulo <strong>Gestión de Pagos</strong> concentra la mayor variedad y cantidad de defectos, lo que lo convierte en el principal foco de riesgo operativo. Los defectos de <strong>Validación de datos</strong> aparecen transversalmente en casi todos los módulos, indicando una debilidad sistémica en las capas de validación.</p>
              <p><strong>Recomendación:</strong> Priorizar una revisión integral de <strong>Gestión de Pagos</strong> y estandarizar las librerías de validación de datos para todos los módulos. Implementar pruebas de integración que cubran los flujos críticos identificados.</p>
            </div>
          </div>
        </div>
      }

      <app-chart-card title="Scatter: Tiempo vs Severidad" subtitle="Relación entre severidad y tiempo de resolución"
        interpretacion="Cada punto representa un defecto. Muestra si los defectos críticos tienden a resolverse más rápido o más lento que los de menor severidad."
        conclusion="Si los críticos tardan más, puede indicar complejidad en su resolución o falta de priorización."
        recomendacion="Establecer SLA diferenciados por severidad para garantizar tiempos adecuados.">
        <button header-action class="interp-btn" (click)="toggleScatterInterp()">{{ showScatterInterp() ? '✕' : '📋' }} Interpretación</button>
        <canvas baseChart type="scatter" [data]="scatterData()" [options]="scatterOptions" style="height: 300px"></canvas>
      </app-chart-card>
      @if (showScatterInterp()) {
        <div class="interp-backdrop" (click)="showScatterInterp.set(false)"></div>
        <div class="interp-overlay">
          <div class="interp-head">
            <strong>Scatter — Interpretación</strong>
            <button class="interp-close" (click)="showScatterInterp.set(false)">✕</button>
          </div>
          <div class="interp-split">
            <div class="interp-chart">
              <canvas baseChart type="scatter" [data]="scatterData()" [options]="scatterModalOptions" style="height: 280px; width: 100%"></canvas>
            </div>
            <div class="interp-body">
              <p>Cada punto representa un <strong>defecto individual</strong> ubicado según su severidad (1 = Baja, 2 = Media, 3 = Alta, 4 = Crítica) y su <strong>tiempo de resolución en horas</strong>.</p>
              <p><strong>Análisis de correlación:</strong></p>
              <ul>
                <li><strong>Defectos Críticos (4):</strong> 10 defectos con tiempos de 1h a 18h (media 7.2h). Solo 2 superan 12h. Esto indica que el equipo prioriza adecuadamente los críticos, aunque la variabilidad sigue siendo alta.</li>
                <li><strong>Defectos Altos (3):</strong> 25 defectos con tiempos entre 2h y 42h (media 14.5h). Presentan la mayor dispersión vertical, señal de que no hay un proceso estandarizado para este nivel.</li>
                <li><strong>Defectos Medios (2):</strong> 74 defectos — el grupo más numeroso. Tiempos entre 2h y 52h (media 17.2h). La nube se extiende uniformemente, sugiriendo atención sin priorización.</li>
                <li><strong>Defectos Bajos (1):</strong> 71 defectos con tiempos de 3h hasta 61h (media 20.5h). Contradictoriamente, los defectos más simples tienen <strong>el tiempo promedio más alto</strong>, lo que revela una falta de proceso de resolución rápida para issues menores.</li>
              </ul>
              <hr>
              <p><strong>Interpretación clave:</strong> No existe una correlación negativa clara (los más severos no siempre se resuelven más rápido). La nube de puntos es <strong>homogénea verticalmente</strong> en todos los niveles de severidad, lo que indica que el equipo atiende los defectos sin una diferenciación clara por criticidad. El hallazgo más preocupante: los defectos <strong>Bajos</strong> tardan en promedio <strong>3× más</strong> que los Críticos, cuando deberían resolverse en horas.</p>
              <p><strong>Recomendación:</strong> Implementar un sistema de SLA por severidad con colas de atención diferenciadas. Automatizar la resolución de defectos de baja severidad (validaciones simples, mensajes de error) para liberar capacidad del equipo en los casos críticos. Establecer un límite máximo de 8h para defectos Bajos mediante reglas de escalamiento automático.</p>
            </div>
          </div>
        </div>
      }

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
        <button header-action class="interp-btn" (click)="toggleControlInterp()">{{ showControlInterp() ? '✕' : '📋' }} Interpretación</button>
        <canvas baseChart type="line" [data]="controlChartData()" [options]="controlChartOptions" style="height: 300px"></canvas>
      </app-chart-card>
      @if (showControlInterp()) {
        <div class="interp-backdrop" (click)="showControlInterp.set(false)"></div>
        <div class="interp-overlay">
          <div class="interp-head">
            <strong>Carta de Control — Interpretación</strong>
            <button class="interp-close" (click)="showControlInterp.set(false)">✕</button>
          </div>
          <div class="interp-split">
            <div class="interp-chart">
              <canvas baseChart type="line" [data]="controlChartData()" [options]="controlModalOptions" style="height: 280px; width: 100%"></canvas>
            </div>
            <div class="interp-body">
              <p>La carta de control (I-MR) monitorea la <strong>estabilidad del proceso de resolución</strong> defecto por defecto. Las líneas horizontales representan:</p>
              <ul>
                <li><strong>Línea verde discontinua:</strong> Media del proceso = <strong>17.8 h</strong></li>
                <li><strong>Líneas rojas discontinuas:</strong> Límites de control ±3σ — <strong>LCS = 41.2 h</strong> (Upper Control Limit), <strong>LCI = 0 h</strong> (Lower Control Limit, truncado)</li>
              </ul>
              <p><strong>Reglas de estabilidad (Western Electric):</strong></p>
              <ul>
                <li><strong>Puntos fuera de límites:</strong> Se identifican ~5 defectos con tiempos &gt; 41 h. Esto representa un <strong>2.8%</strong> de los datos, ligeramente por encima del 0.27% esperado en una distribución normal. Estos son <strong>causas especiales</strong> que requieren investigación individual.</li>
                <li><strong>Rachas (runs):</strong> Se observan múltiples secuencias de 5-7 puntos consecutivos por encima de la media (defectos #15-21, #38-43, #52-58). Esto sugiere <strong>cambios temporales en el proceso</strong> —posiblemente semanas con alta carga laboral o rotación del equipo.</li>
              </ul>
              <hr>
              <p><strong>Interpretación:</strong> El proceso de resolución <strong>no está bajo control estadístico</strong>. Existen causas especiales recurrentes y patrones de racha que indican inestabilidad. La variabilidad es alta: un defecto puede resolverse en 1 h o tardar 61 h sin un patrón predecible. Esto imposibilita establecer tiempos de entrega confiables para el negocio.</p>
              <p><strong>Recomendación:</strong> Investigar los defectos fuera de LCS (defectos &gt; 41 h) para identificar causas raíz. Implementar un sistema de priorización FIFO con topes por severidad. Establecer reuniones diarias de triage para evitar acumulaciones. Recalcular los límites de control cada 30 defectos para monitorear la mejora del proceso.</p>
            </div>
          </div>
        </div>
      }

      <app-chart-card title="Gauge Charts" subtitle="Indicadores visuales tipo semáforo"
        interpretacion="Cada gauge muestra el valor actual de un KPI clave frente a su meta. El color indica si se cumple (verde), está cerca (amarillo) o fuera (rojo) de la meta."
        conclusion="Los gauges dan una visión rápida del estado de los principales indicadores."
        recomendacion="Monitorear los gauges periódicamente para detectar desviaciones tempranas.">
        <button header-action class="interp-btn" (click)="toggleGaugeInterp()">{{ showGaugeInterp() ? '✕' : '📋' }} Interpretación</button>
        <div class="gauge-row">
          @for (g of gauges(); track g.label) {
            <app-gauge-chart [label]="g.label" [value]="g.value" [unit]="g.unit" [meta]="g.meta" [metaDir]="g.metaDir" />
          }
        </div>
      </app-chart-card>
      @if (showGaugeInterp()) {
        <div class="interp-backdrop" (click)="showGaugeInterp.set(false)"></div>
        <div class="interp-overlay">
          <div class="interp-head">
            <strong>Gauge Charts — Interpretación</strong>
            <button class="interp-close" (click)="showGaugeInterp.set(false)">✕</button>
          </div>
          <div class="interp-split">
            <div class="interp-chart">
              <div class="gauge-row">
                @for (g of gauges(); track g.label) {
                  <app-gauge-chart [label]="g.label" [value]="g.value" [unit]="g.unit" [meta]="g.meta" [metaDir]="g.metaDir" />
                }
              </div>
            </div>
            <div class="interp-body">
              <p>Los gauges proporcionan una <strong>vista de semáforo</strong> del estado actual del proceso de pruebas. El color indica el desempeño frente a la meta:</p>
              <ul>
                <li><strong>🟢 Sigma (2.68σ):</strong> Por debajo de la meta de 3.5σ para procesos críticos. Nivel de calidad insuficiente que requiere mejoras estructurales.</li>
                <li><strong>🔴 DPMO (120,000):</strong> Lejano de la meta de 30,000. Equivale a ~120 defectos por cada 1,000 oportunidades, consistente con un Sigma bajo.</li>
                <li><strong>🟢 Tiempo Promedio (17.8 h):</strong> Dentro de la meta de &le;24 h. Sin embargo, la media esconde la alta variabilidad revelada en el Control Chart.</li>
                <li><strong>🟡 Automatización:</strong> Cobertura de pruebas automatizadas por debajo del 60% deseable. La meta debería ser al menos 60% para liberar al equipo QA de pruebas repetitivas.</li>
                <li><strong>🔴 % Resueltos:</strong> Porcentaje de defectos cerrados sobre el total. Una tasa por debajo del 80% acumula deuda técnica.</li>
              </ul>
              <hr>
              <p><strong>Interpretación general:</strong> El sistema tiene <strong>2 indicadores en rojo</strong> (Sigma y DPMO) que reflejan la debilidad central del proceso de pruebas. El tiempo promedio parece aceptable pero la variabilidad es alta. Automatización y resolución requieren atención para evitar que la calidad se deteriore más.</p>
              <p><strong>Recomendación:</strong> Priorizar iniciativas que eleven el Sigma (mejores validaciones, más cobertura de pruebas). Establecer un plan trimestral para aumentar la automatización al 60%. Implementar un tablero semanal de seguimiento de estos 5 indicadores con alertas automáticas cuando algún gauge pase a rojo.</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .gauge-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
    .interp-btn { padding: 4px 12px; border: 1px solid #CBD5E1; border-radius: 6px; background: #F8FAFC; color: #475569; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
    .interp-btn:hover { background: #E2E8F0; border-color: #94A3B8; }
    .interp-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.35); z-index: 999; animation: fadeIn 0.2s ease; }
    .interp-overlay { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 860px; max-width: 94vw; max-height: 85vh; background: white; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.2); z-index: 1000; animation: modalIn 0.25s ease; display: flex; flex-direction: column; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalIn { from { opacity: 0; transform: translate(-50%,-50%) scale(0.95); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
    .interp-head { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
    .interp-head strong { font-size: 16px; color: #0F172A; }
    .interp-close { width: 28px; height: 28px; border: none; border-radius: 6px; background: #F1F5F9; color: #64748B; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
    .interp-close:hover { background: #E2E8F0; color: #0F172A; }
    .interp-split { display: flex; gap: 20px; padding: 16px 24px 24px; overflow-y: auto; flex: 1; min-height: 0; }
    .interp-chart { flex: 1; min-width: 0; display: flex; align-items: center; }
    .interp-body { flex: 1; font-size: 14px; color: #334155; line-height: 1.8; overflow-y: auto; max-height: 400px; padding-right: 4px; }
    .interp-body p { margin: 0 0 12px; }
    .interp-body ol { margin: 8px 0 16px; padding-left: 24px; }
    .interp-body li { margin-bottom: 6px; }
    .interp-body hr { border: none; border-top: 1px solid #E2E8F0; margin: 16px 0; }
    @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }
    @media (max-width: 700px) { .interp-split { flex-direction: column; } .interp-chart { min-height: 200px; } }
  `]
})
export class Graficos {
  constructor(public dmaicService: DmaicService) {}

  readonly showInterp = signal(false);
  readonly showBoxInterp = signal(false);
  readonly showHeatmapInterp = signal(false);
  readonly showScatterInterp = signal(false);
  readonly showControlInterp = signal(false);
  readonly showGaugeInterp = signal(false);

  toggleInterp() { this.showInterp.update(v => !v); }
  toggleBoxInterp() { this.showBoxInterp.update(v => !v); }
  toggleHeatmapInterp() { this.showHeatmapInterp.update(v => !v); }
  toggleScatterInterp() { this.showScatterInterp.update(v => !v); }
  toggleControlInterp() { this.showControlInterp.update(v => !v); }
  toggleGaugeInterp() { this.showGaugeInterp.update(v => !v); }

  readonly chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];

  readonly paretoData = computed<ChartConfiguration<'bar' | 'line'>['data']>(() => {
    const p = this.dmaicService.pareto();
    return { labels: p.map(x => x.tipo), datasets: [
      { data: p.map(x => x.cantidad), label: 'Cantidad', backgroundColor: '#3B82F6', borderRadius: 4 },
      { data: p.map(x => x.acumulado), label: '% Acumulado', type: 'line', order: 2, borderColor: '#EF4444', backgroundColor: '#EF4444', yAxisID: 'y1', tension: 0.3, fill: false, pointBackgroundColor: '#EF4444', pointRadius: 4 },
    ]};
  });
  readonly paretoOptions: ChartConfiguration<'bar' | 'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' } },
    scales: { y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } }, y1: { position: 'right', min: 0, max: 100, title: { display: true, text: '% Acumulado' }, grid: { drawOnChartArea: false } } }
  };
  readonly paretoModalOptions: ChartConfiguration<'bar' | 'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } } },
    scales: { y: { beginAtZero: true, display: false }, y1: { position: 'right', min: 0, max: 100, title: { display: false }, grid: { drawOnChartArea: false }, ticks: { font: { size: 9 } } } }
  };
  readonly boxModalOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 6, font: { size: 10 } } } },
    scales: { y: { beginAtZero: true, display: false } }
  };
  readonly heatmapModalOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 4, font: { size: 9 } } } },
    scales: { x: { stacked: true, display: false }, y: { stacked: true, beginAtZero: true, display: false } }
  };
  readonly scatterModalOptions: ChartConfiguration<'scatter'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { type: 'linear', position: 'bottom', title: { display: false }, min: 0, max: 5, ticks: { font: { size: 9 } } }, y: { beginAtZero: true, title: { display: false }, ticks: { font: { size: 9 } } } }
  };
  readonly controlModalOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, padding: 4, font: { size: 9 } } } },
    scales: { y: { beginAtZero: true, display: false } }
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
