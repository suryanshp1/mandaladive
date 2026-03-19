import React from 'react';
import { Settings, Download, RotateCcw, Share2, MoreHorizontal, Maximize2, Minimize2 } from 'lucide-react';
import { MandalaState, ShapeType } from '../types';

interface ControlsProps {
  state: MandalaState;
  onChange: (key: keyof MandalaState, value: any) => void;
  onExport: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  state,
  onChange,
  onExport,
  onReset,
  onToggleFullscreen,
  isFullscreen,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const shapes: ShapeType[] = ['circle', 'triangle', 'square', 'hexagon'];

  const [showToast, setShowToast] = React.useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      {showToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium z-50 animate-in fade-in slide-in-from-top-4 max-w-[calc(100vw-2rem)] text-center">
          Link copied to clipboard!
        </div>
      )}
      <div className="absolute left-4 right-4 bottom-4 md:left-auto md:right-4 md:top-4 md:bottom-4 md:w-80 flex flex-col gap-3 md:gap-4 pointer-events-none z-10">
        {/* Top Bar Actions */}
        <div className="flex justify-end gap-2 pointer-events-auto">
          {/* Desktop actions */}
          <button
            onClick={onToggleFullscreen}
            className="hidden md:inline-flex p-2.5 md:p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            onClick={onReset}
            className="hidden md:inline-flex p-2.5 md:p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl transition-colors"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={handleShare}
            className="hidden md:inline-flex p-2.5 md:p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl transition-colors"
            title="Share"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={onExport}
            className="hidden md:inline-flex p-2.5 md:p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl transition-colors"
            title="Export PNG"
          >
            <Download size={20} />
          </button>

          {/* Mobile overflow menu */}
          <div className="relative md:hidden">
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="inline-flex p-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl transition-colors"
              title="More"
            >
              <MoreHorizontal size={20} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onToggleFullscreen();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onReset();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleShare();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
                >
                  <Share2 size={16} />
                  Copy link
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onExport();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors"
                >
                  <Download size={16} />
                  Export PNG
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setIsMenuOpen(false);
              setIsOpen(!isOpen);
            }}
            className="p-2.5 md:p-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl transition-colors"
            title="Toggle Controls"
          >
            <Settings size={20} />
          </button>
        </div>

      {/* Controls Panel */}
      <div
        className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 overflow-y-auto pointer-events-auto transition-all duration-300 max-h-[60vh] md:max-h-none flex-1 ${
          isOpen ? 'opacity-100 translate-y-0 md:translate-x-0' : 'opacity-0 translate-y-6 md:translate-x-10 pointer-events-none'
        }`}
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="space-y-8">
          {/* Shape Controls */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-white/50 uppercase tracking-widest">Shape</h3>
            <div className="grid grid-cols-2 gap-2">
              {shapes.map((s) => (
                <button
                  key={s}
                  onClick={() => onChange('shape', s)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    state.shape === s
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={state.isFill}
                  onChange={(e) => onChange('isFill', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${state.isFill ? 'bg-purple-500' : 'bg-white/20'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${state.isFill ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-sm font-medium text-white/80 group-hover:text-white">Fill Shapes</span>
            </label>
          </div>

          {/* Recursion Controls */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-white/50 uppercase tracking-widest">Recursion</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Depth</span>
                <span className="font-mono">{state.depth}</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={state.depth}
                onChange={(e) => onChange('depth', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Scale</span>
                <span className="font-mono">{state.scale.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={state.scale}
                onChange={(e) => onChange('scale', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Rotation</span>
                <span className="font-mono">{(state.rotation * (180 / Math.PI)).toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI / 2}
                step="0.01"
                value={state.rotation}
                onChange={(e) => onChange('rotation', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Symmetry</span>
                <span className="font-mono">{state.symmetry}</span>
              </div>
              <input
                type="range"
                min="3"
                max="24"
                value={state.symmetry}
                onChange={(e) => onChange('symmetry', parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Color Controls */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-white/50 uppercase tracking-widest">Color & Glow</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Base Hue</span>
                <span className="font-mono">{state.baseHue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={state.baseHue}
                onChange={(e) => onChange('baseHue', parseInt(e.target.value))}
                style={{
                  background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)'
                }}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Hue Shift</span>
                <span className="font-mono">{state.hueShift}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={state.hueShift}
                onChange={(e) => onChange('hueShift', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Glow Intensity</span>
                <span className="font-mono">{state.glowIntensity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={state.glowIntensity}
                onChange={(e) => onChange('glowIntensity', parseFloat(e.target.value))}
              />
            </div>
          </div>

          {/* Motion Controls */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono text-white/50 uppercase tracking-widest">Motion</h3>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={state.autoRotate}
                  onChange={(e) => onChange('autoRotate', e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${state.autoRotate ? 'bg-purple-500' : 'bg-white/20'}`}></div>
                <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${state.autoRotate ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-sm font-medium text-white/80 group-hover:text-white">Auto Rotate</span>
            </label>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Rotation Speed</span>
                <span className="font-mono">{state.rotationSpeed.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="-0.05"
                max="0.05"
                step="0.001"
                value={state.rotationSpeed}
                onChange={(e) => onChange('rotationSpeed', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Zoom Speed</span>
                <span className="font-mono">{state.zoomSpeed.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="-0.05"
                max="0.05"
                step="0.001"
                value={state.zoomSpeed}
                onChange={(e) => onChange('zoomSpeed', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};
