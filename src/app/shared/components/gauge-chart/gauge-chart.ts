import { Component, input, computed, effect } from '@angular/core';

function gaugeColor(value: number, meta: number, dir: 'up' | 'down'): string {
  if (dir === 'up') {
    if (value >= meta) return '#10B981';
    if (value >= meta * 0.75) return '#F59E0B';
    return '#EF4444';
  }
  if (value <= meta) return '#10B981';
  if (value <= meta * 1.5) return '#F59E0B';
  return '#EF4444';
}

@Component({
  selector: 'app-gauge-chart',
  template: `
    <div class="gauge-wrapper">
      <svg viewBox="0 0 200 130" class="gauge-svg">
        <path d="M 20 110 A 80 80 0 1 1 180 110" fill="none" stroke="#E2E8F0" stroke-width="16" stroke-linecap="round"/>
        <path [attr.d]="arcPath" fill="none" [attr.stroke]="colorVal" stroke-width="16" stroke-linecap="round"
          style="transition: stroke-dashoffset 1s ease-in-out"/>
        <text x="100" y="85" text-anchor="middle" class="gauge-value">{{ value() }}{{ unit() }}</text>
        <text x="100" y="108" text-anchor="middle" class="gauge-label">{{ label() }}</text>
      </svg>
    </div>
  `,
  styles: [`
    .gauge-wrapper { display: flex; justify-content: center; padding: 8px; }
    .gauge-svg { width: 100%; max-width: 200px; height: auto; }
    .gauge-value { font-size: 22px; font-weight: 700; fill: #1E293B; }
    .gauge-label { font-size: 11px; fill: #94A3B8; }
  `]
})
export class GaugeChart {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly unit = input('');
  readonly meta = input.required<number>();
  readonly metaDir = input<'up' | 'down'>('up');

  protected get colorVal() {
    return gaugeColor(this.value(), this.meta(), this.metaDir());
  }

  protected get arcPath(): string {
    const v = Math.min(this.value() / (this.meta() || 1), 1.5);
    const angle = Math.min(v, 1) * 180;
    const rad = (angle - 180) * Math.PI / 180;
    const r = 80;
    const cx = 100, cy = 110;
    const x1 = cx + r * Math.cos(rad);
    const y1 = cy + r * Math.sin(rad);
    const largeArc = angle > 180 ? 1 : 0;
    return `M 20 110 A 80 80 0 ${largeArc} 1 ${x1} ${y1}`;
  }
}
