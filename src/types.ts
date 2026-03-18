export type ShapeType = 'circle' | 'triangle' | 'square' | 'hexagon';

export interface MandalaState {
  shape: ShapeType;
  isFill: boolean;
  depth: number;
  scale: number;
  rotation: number;
  symmetry: number;
  baseHue: number;
  hueShift: number;
  glowIntensity: number;
  autoRotate: boolean;
  rotationSpeed: number;
  zoomSpeed: number;
  zoom: number;
  panX: number;
  panY: number;
  rotationOffset: number;
}

export const DEFAULT_STATE: MandalaState = {
  shape: 'circle',
  isFill: false,
  depth: 50,
  scale: 0.9,
  rotation: 0.1,
  symmetry: 8,
  baseHue: 280, // Purple
  hueShift: 2,
  glowIntensity: 0.6,
  autoRotate: true,
  rotationSpeed: 0.005,
  zoomSpeed: 0.01,
  zoom: 1,
  panX: 0,
  panY: 0,
  rotationOffset: 0,
};
