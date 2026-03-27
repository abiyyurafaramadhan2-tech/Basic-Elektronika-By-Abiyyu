// ElectroVerse Types — © 2026 Abiyyu Rafa Ramadhan

export type PageId = 'home' | 'theory' | 'components' | 'tools';
export type ComponentId = 'resistor' | 'capacitor' | 'diode' | 'transistor';
export type GlowColor = 'cyan' | 'green' | 'purple' | 'orange' | 'gold';

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  color: GlowColor;
  description: string;
}

export interface BandColor {
  name: string;
  hex: string;
  value: number | null;
  multiplier: number | null;
  tolerance: string | null;
}

export interface ResistorState {
  band1: number;
  band2: number;
  band3: number;
  tolerance: number;
}

export interface CapacitorState {
  voltage: number;
  capacitance: number;
  dielectricStrength: number;
  isCharged: boolean;
  chargeLevel: number;
}

export interface DiodeState {
  bias: 'forward' | 'reverse';
  voltage: number;
}

export type TransistorRegion = 'cutoff' | 'active' | 'saturation';

export interface TransistorState {
  baseCurrent: number;
  collectorVoltage: number;
  beta: number;
}

export interface OhmicState {
  voltage: number;
  current: number;
  resistance: number;
  locked: 'voltage' | 'current' | 'resistance';
  stressMode: boolean;
  isBurnt: boolean;
}

export interface AppContextType {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  ghostActive: boolean;
  setGhostActive: (v: boolean) => void;
  selectedComponent: ComponentId | null;
  setSelectedComponent: (id: ComponentId | null) => void;
  currentFlow: { voltage: number; resistance: number };
  setCurrentFlow: (v: { voltage: number; resistance: number }) => void;
}

export interface TheorySection {
  id: string;
  title: string;
  icon: string;
  color: GlowColor;
  content: string;
  formula?: string;
  keyPoints: string[];
}

export interface ComponentCard {
  id: ComponentId;
  name: string;
  symbol: string;
  color: GlowColor;
  description: string;
  unit: string;
  discovered: string;
}
