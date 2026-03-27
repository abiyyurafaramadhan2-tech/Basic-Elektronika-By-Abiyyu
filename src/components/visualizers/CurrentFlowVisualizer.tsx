import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel, GlassBadge } from '../ui/GlassPanel';

interface Props {
  voltage: number;
  resistance: number;
  showControls?: boolean;
  onVoltageChange?: (v: number) => void;
  onResistanceChange?: (v: number) => void;
}

interface Waypoint { x: number; y: number }
interface Electron { progress: number; opacity: number }

const W = 540;
const H = 260;

// Circuit waypoints (normalized, scaled to canvas)
const WAYPOINTS: Waypoint[] = [
  { x: 60,  y: 180 },  // 0: battery bottom
  { x: 60,  y: 80  },  // 1: battery top
  { x: 160, y: 80  },  // 2: before resistor
  { x: 220, y: 80  },  // 3: resistor start
  { x: 320, y: 80  },  // 4: resistor end
  { x: 420, y: 80  },  // 5: after resistor
  { x: 480, y: 80  },  // 6: top-right corner
  { x: 480, y: 180 },  // 7: bottom-right corner
  { x: 60,  y: 180 },  // 8: back to battery (close loop)
];

function segmentLengths(pts: Waypoint[]): number[] {
  const lens: number[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    lens.push(Math.sqrt(dx * dx + dy * dy));
  }
  return lens;
}

function getPointAtT(t: number, pts: Waypoint[], segLens: number[]): Waypoint {
  const total = segLens.reduce((a, b) => a + b, 0);
  let target = ((t % 1) + 1) % 1 * total;
  let acc = 0;
  for (let i = 0; i < segLens.length; i++) {
    if (target <= acc + segLens[i]) {
      const frac = (target - acc) / segLens[i];
      return {
        x: pts[i].x + frac * (pts[i + 1].x - pts[i].x),
        y: pts[i].y + frac * (pts[i + 1].y - pts[i].y),
      };
    }
    acc += segLens[i];
  }
  return pts[pts.length - 1];
}

function drawResistorZigzag(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, color: string) {
  const steps = 8;
  const h = 10;
  const stepW = (x2 - x1) / steps;
  ctx.beginPath();
  ctx.moveTo(x1, y);
  for (let i = 0; i < steps; i++) {
    const mx = x1 + stepW * (i + 0.5);
    const my = y + (i % 2 === 0 ? -h : h);
    ctx.lineTo(mx, my);
  }
  ctx.lineTo(x2, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBattery(ctx: CanvasRenderingContext2D, x: number, yBottom: number, yTop: number) {
  const midY = (yTop + yBottom) / 2;
  const gap  = 12;

  // Vertical wire
  ctx.beginPath();
  ctx.moveTo(x, yBottom);
  ctx.lineTo(x, midY + gap / 2 + 8);
  ctx.moveTo(x, midY - gap / 2 - 8);
  ctx.lineTo(x, yTop);
  ctx.strokeStyle = 'rgba(0,229,255,0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Plates
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 3;
  // Negative (shorter)
  ctx.beginPath();
  ctx.moveTo(x - 7, midY + gap / 2);
  ctx.lineTo(x + 7, midY + gap / 2);
  ctx.stroke();
  // Positive (longer)
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, midY - gap / 2);
  ctx.lineTo(x + 12, midY - gap / 2);
  ctx.stroke();

  // Labels
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.fillStyle = '#00e5ff';
  ctx.textAlign = 'center';
  ctx.fillText('+', x - 22, midY - gap / 2 + 4);
  ctx.fillText('−', x - 22, midY + gap / 2 + 4);
}

export function CurrentFlowVisualizer({
  voltage,
  resistance,
  showControls = true,
  onVoltageChange,
  onResistanceChange,
}: Props) {
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const animRef    = useRef<number>(0);
  const stateRef   = useRef({
    electrons: [] as Electron[],
    voltage,
    resistance,
    lastTime: 0,
  });

  // Sync props into ref without re-triggering effect
  stateRef.current.voltage    = voltage;
  stateRef.current.resistance = resistance;

  const segLens = useRef(segmentLengths(WAYPOINTS));

  const initElectrons = useCallback((v: number, r: number) => {
    const current  = v / Math.max(r, 1);
    const count    = Math.max(4, Math.min(20, Math.round(current * 4 + 4)));
    return Array.from({ length: count }, (_, i): Electron => ({
      progress: i / count,
      opacity:  0.7 + Math.random() * 0.3,
    }));
  }, []);

  useEffect(() => {
    stateRef.current.electrons = initElectrons(voltage, resistance);
  }, [voltage, resistance, initElectrons]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina scaling
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const draw = (timestamp: number) => {
      const delta = Math.min((timestamp - stateRef.current.lastTime) / 1000, 0.05);
      stateRef.current.lastTime = timestamp;

      const { voltage: V, resistance: R, electrons } = stateRef.current;
      const current = V / Math.max(R, 1);
      const speed   = Math.min(0.25, current * 0.012); // 0-0.25 units/sec

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = 'rgba(4, 8, 16, 0)';
      ctx.fillRect(0, 0, W, H);

      // Wire glow intensity based on voltage
      const wireGlow = Math.min(1, V / 12);
      const wireColor = `rgba(0, ${Math.floor(200 + wireGlow * 55)}, ${Math.floor(180 + wireGlow * 75)}, ${0.55 + wireGlow * 0.35})`;
      const wireGlowColor = `rgba(0, 229, 255, ${wireGlow * 0.4})`;

      ctx.shadowColor = wireGlowColor;
      ctx.shadowBlur  = wireGlow * 12;

      // Draw wires
      ctx.beginPath();
      ctx.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
      ctx.lineTo(WAYPOINTS[1].x, WAYPOINTS[1].y); // battery left side
      ctx.moveTo(WAYPOINTS[1].x, WAYPOINTS[1].y);
      ctx.lineTo(WAYPOINTS[2].x, WAYPOINTS[2].y); // top wire to resistor
      ctx.moveTo(WAYPOINTS[4].x, WAYPOINTS[4].y);
      ctx.lineTo(WAYPOINTS[5].x, WAYPOINTS[5].y); // wire after resistor
      ctx.lineTo(WAYPOINTS[6].x, WAYPOINTS[6].y); // right top corner
      ctx.lineTo(WAYPOINTS[7].x, WAYPOINTS[7].y); // right side down
      ctx.lineTo(WAYPOINTS[8].x, WAYPOINTS[8].y); // bottom wire back
      ctx.strokeStyle = wireColor;
      ctx.lineWidth   = 2;
      ctx.stroke();

      // Resistor zigzag
      ctx.shadowBlur = wireGlow * 8;
      drawResistorZigzag(ctx, WAYPOINTS[2].x, WAYPOINTS[4].x, WAYPOINTS[2].y,
        `rgba(255, ${Math.floor(150 + wireGlow * 80)}, 50, ${0.7 + wireGlow * 0.3})`
      );

      // Battery
      ctx.shadowBlur = 0;
      drawBattery(ctx, WAYPOINTS[0].x, WAYPOINTS[0].y, WAYPOINTS[1].y);

      // Component labels
      ctx.shadowBlur = 0;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(255, 160, 80, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText(`R=${R}Ω`, (WAYPOINTS[2].x + WAYPOINTS[4].x) / 2, WAYPOINTS[2].y - 22);

      ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.fillText(`${V}V`, WAYPOINTS[0].x - 28, (WAYPOINTS[0].y + WAYPOINTS[1].y) / 2);

      // Current display
      ctx.fillStyle = 'rgba(57, 255, 20, 0.85)';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(`I = ${(current * 1000).toFixed(1)} mA`, 300, H - 20);

      // Power display
      const power = V * current;
      ctx.fillStyle = power > 2 ? 'rgba(255, 100, 50, 0.9)' : 'rgba(57, 255, 20, 0.7)';
      ctx.fillText(`P = ${power.toFixed(2)} W`, 430, H - 20);

      // Move & draw electrons
      electrons.forEach(e => {
        e.progress = (e.progress + speed * delta) % 1;
        const pt = getPointAtT(e.progress, WAYPOINTS, segLens.current);

        // Electron glow
        const gradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 8);
        gradient.addColorStop(0, `rgba(0, 240, 255, ${e.opacity})`);
        gradient.addColorStop(0.5, `rgba(0, 200, 255, ${e.opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');

        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core bright dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Voltage too high warning
      if (V > 10) {
        ctx.globalAlpha = (V - 10) / 4;
        ctx.fillStyle = 'rgba(255, 50, 50, 0.04)';
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []); // runs once, reads from ref

  const current = voltage / Math.max(resistance, 1);
  const power   = voltage * current;

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas */}
      <GlassPanel padding="none" className="overflow-hidden rounded-2xl relative">
        <canvas
          ref={canvasRef}
          className="w-full block rounded-2xl"
          style={{ minHeight: H }}
        />
        {/* Overlay data chips */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-none">
          <GlassBadge color="cyan">⚡ {voltage}V</GlassBadge>
          <GlassBadge color="orange">R {resistance}Ω</GlassBadge>
          <GlassBadge color={power > 2 ? 'orange' : 'green'}>
            {(current * 1000).toFixed(1)} mA
          </GlassBadge>
        </div>
      </GlassPanel>

      {/* Controls */}
      {showControls && (onVoltageChange || onResistanceChange) && (
        <div className="grid grid-cols-2 gap-4">
          {onVoltageChange && (
            <GlassPanel padding="sm" className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="data-label">Voltage</span>
                <span className="data-value">{voltage}V</span>
              </div>
              <input
                type="range" min={1} max={12} step={0.5}
                value={voltage}
                onChange={e => onVoltageChange(Number(e.target.value))}
                className="w-full accent-neon-cyan h-1 rounded-full cursor-pointer"
              />
            </GlassPanel>
          )}
          {onResistanceChange && (
            <GlassPanel padding="sm" className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="data-label">Resistance</span>
                <span className="data-value">{resistance}Ω</span>
              </div>
              <input
                type="range" min={10} max={1000} step={10}
                value={resistance}
                onChange={e => onResistanceChange(Number(e.target.value))}
                className="w-full accent-neon-orange h-1 rounded-full cursor-pointer"
              />
            </GlassPanel>
          )}
        </div>
      )}
    </div>
  );
        }
