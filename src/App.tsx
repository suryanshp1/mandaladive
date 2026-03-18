/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MandalaCanvas } from './components/MandalaCanvas';
import { Controls } from './components/Controls';
import { MandalaState, DEFAULT_STATE } from './types';

export default function App() {
  const [state, setState] = useState<MandalaState>(() => {
    const saved = localStorage.getItem('mandaladive-state');
    if (saved) {
      try {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { zoom, panX, panY, rotationOffset, ...configToSave } = state;
    localStorage.setItem('mandaladive-state', JSON.stringify(configToSave));
  }, [
    state.shape, state.isFill, state.depth, state.scale, state.rotation,
    state.symmetry, state.hueShift, state.glowIntensity, state.autoRotate,
    state.rotationSpeed, state.zoomSpeed, state.baseHue
  ]);

  const handleChange = useCallback((key: keyof MandalaState, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setState((prev) => {
      let newZoom = prev.zoom * (1 - delta);
      let newBaseHue = prev.baseHue;
      let newRotationOffset = prev.rotationOffset;
      
      // Infinite zoom illusion logic
      while (newZoom > 1 / prev.scale) {
        newZoom = newZoom * prev.scale;
        newBaseHue = (newBaseHue + prev.hueShift) % 360;
        newRotationOffset = newRotationOffset + prev.rotation;
      }
      while (newZoom < prev.scale) {
        newZoom = newZoom / prev.scale;
        newBaseHue = (newBaseHue - prev.hueShift + 360) % 360;
        newRotationOffset = newRotationOffset - prev.rotation;
      }
      
      return { ...prev, zoom: newZoom, baseHue: newBaseHue, rotationOffset: newRotationOffset };
    });
  }, []);

  const handlePan = useCallback((dx: number, dy: number) => {
    setState((prev) => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy,
    }));
  }, []);

  const handleResetCenter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      panX: 0,
      panY: 0,
      zoom: 1,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  // Continuous zoom loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      setState((prev) => {
        if (prev.zoomSpeed === 0) return prev;
        
        // Adjust zoom speed based on delta time to keep it frame-rate independent
        // zoomSpeed is per frame (assuming 60fps, so ~16.6ms per frame)
        const timeScale = deltaTime / 16.66;
        const deltaZoom = prev.zoomSpeed * timeScale;
        
        let newZoom = prev.zoom * (1 + deltaZoom);
        let newBaseHue = prev.baseHue;
        let newRotationOffset = prev.rotationOffset;
        
        // Infinite zoom illusion logic
        while (newZoom > 1 / prev.scale) {
          newZoom = newZoom * prev.scale;
          newBaseHue = (newBaseHue + prev.hueShift) % 360;
          newRotationOffset = newRotationOffset + prev.rotation;
        }
        while (newZoom < prev.scale) {
          newZoom = newZoom / prev.scale;
          newBaseHue = (newBaseHue - prev.hueShift + 360) % 360;
          newRotationOffset = newRotationOffset - prev.rotation;
        }
        
        return { ...prev, zoom: newZoom, baseHue: newBaseHue, rotationOffset: newRotationOffset };
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleExport = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `mandaladive-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-[#050505]">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 pointer-events-none flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-sans font-bold tracking-tighter text-white">
            Mandala<span className="text-purple-500">Dive</span>
          </h1>
          <p className="text-white/50 font-mono text-xs mt-1 uppercase tracking-widest">
            Create. Zoom. Lose yourself.
          </p>
        </div>
      </div>

      {/* Canvas */}
      <MandalaCanvas
        state={state}
        onZoom={handleZoom}
        onPan={handlePan}
        onResetCenter={handleResetCenter}
      />

      {/* Controls */}
      <Controls
        state={state}
        onChange={handleChange}
        onExport={handleExport}
        onReset={handleReset}
      />
    </div>
  );
}
