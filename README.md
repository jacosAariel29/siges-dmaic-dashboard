# SIGES Dashboard v1 — DMAIC Analytics

Dashboard de análisis de incidentes SIGES basado en la metodología DMAIC. Construido con **Angular 21** (standalone), **Angular Material**, **Chart.js** y **Tailwind CSS**.

## Funcionalidades

### Tab 1 — Dashboard Principal
- 13 KPIs de calidad: DPMO, Nivel Sigma, Rendimiento, CP, CPK, % Defectos, Total Incidentes, etc.
- Semáforo de rendimiento (verde/amarillo/rojo) con comparación vs meta
- Resumen ejecutivo con indicadores clave

### Tab 2 — Gráficos
- 16 gráficos interactivos: Pareto, histogramas, control chart, DPMO/Sigma trends, radar, scatter, heatmap, funnel, gauges, barras, pastel, líneas, burbujas, violín
- Cada gráfico incluye interpretación, conclusión y recomendación

### Tab 3 — Tablas
- 8 tablas dinámicas: resumen KPIs, detalle incidentes, Pareto, severidad, tendencias, módulos, métodos, evolución mensual
- Búsqueda, paginación, ordenamiento y exportación CSV

### Filtros
- 6 filtros reactivos: Módulo, Estado, Severidad, Tipo de Defecto, Mes, Método
- Todos los charts y tablas se actualizan automáticamente al cambiar filtros

## Stack
| Tecnología | Versión |
|-----------|---------|
| Angular | 21 (standalone) |
| Angular Material | 21 |
| Chart.js / ng2-charts | 4.5 / 10 |
| TypeScript | 5.9 |
| RxJS | 7.8 |
| Zone.js | 0.16 |
| Vite (bundler) | — |

## Requisitos
- Node.js >= 20
- npm >= 11

## Instalación
```bash
npm install
ng serve
```

Navegar a `http://localhost:4200`

## Build
```bash
ng build
```

Los artefactos se generan en `dist/`.

## Datos
Los datos de incidentes están en `src/assets/data/incidents.json` (180 registros) con campos: Módulo, Estado, Severidad, Tipo de Defecto, Fecha, Método, Descripción, Acción.
