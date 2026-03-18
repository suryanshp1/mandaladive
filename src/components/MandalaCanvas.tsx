import React, { useEffect, useRef } from 'react';
import { MandalaState, ShapeType } from '../types';

interface MandalaCanvasProps {
  state: MandalaState;
  onZoom: (delta: number) => void;
  onPan: (dx: number, dy: number) => void;
  onResetCenter: () => void;
}

export const MandalaCanvas: React.FC<MandalaCanvasProps> = ({
  state,
  onZoom,
  onPan,
  onResetCenter,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const timeRef = useRef<number>(0);
  
  // Interaction state
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    const drawShape = (ctx: CanvasRenderingContext2D, size: number, shape: ShapeType) => {
      ctx.beginPath();
      switch (shape) {
        case 'circle':
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          break;
        case 'square':
          ctx.rect(-size / 2, -size / 2, size, size);
          break;
        case 'triangle':
          ctx.moveTo(0, -size);
          ctx.lineTo(size * Math.cos(Math.PI / 6), size * Math.sin(Math.PI / 6));
          ctx.lineTo(-size * Math.cos(Math.PI / 6), size * Math.sin(Math.PI / 6));
          ctx.closePath();
          break;
        case 'hexagon':
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            if (i === 0) ctx.moveTo(size * Math.cos(angle), size * Math.sin(angle));
            else ctx.lineTo(size * Math.cos(angle), size * Math.sin(angle));
          }
          ctx.closePath();
          break;
      }
    };

    const drawLayer = (
      ctx: CanvasRenderingContext2D,
      totalDepth: number,
      initialScale: number,
      initialRotation: number,
      baseSize: number,
      currentState: MandalaState
    ) => {
      let currentScale = initialScale;
      let currentRotation = initialRotation;

      for (let currentDepth = totalDepth; currentDepth > 0; currentDepth--) {
        const layerIndex = (currentState.depth + 5) - currentDepth; // Assuming extraLayers = 5
        const rawHue = currentState.baseHue + (layerIndex - 5) * currentState.hueShift;
        const hue = ((rawHue % 360) + 360) % 360;
        
        const opacity = Math.max(0, Math.min(1, 1 - (layerIndex - 5) / currentState.depth));
        
        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${opacity})`;
        ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${0.2 * opacity})`;
        
        if (currentState.glowIntensity > 0) {
          ctx.shadowBlur = 10 * currentState.glowIntensity;
          ctx.shadowColor = `hsla(${hue}, 100%, 60%, ${currentState.glowIntensity})`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.lineWidth = 2 / currentScale; // Keep line width consistent

        for (let i = 0; i < currentState.symmetry; i++) {
          ctx.save();
          ctx.rotate((2 * Math.PI / currentState.symmetry) * i + currentRotation);
          
          ctx.translate(baseSize * 0.5, 0); // Offset from center
          
          drawShape(ctx, baseSize * 0.5, currentState.shape);
          
          if (currentState.isFill) {
            ctx.fill();
          }
          ctx.stroke();
          
          ctx.restore();
        }

        // Prepare for next layer
        currentScale *= currentState.scale;
        currentRotation += currentState.rotation;
        ctx.scale(currentState.scale, currentState.scale);
      }
    };

    const render = () => {
      const currentState = stateRef.current;
      
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2 + currentState.panX;
      const centerY = canvas.height / 2 + currentState.panY;
      
      // Base size relative to screen
      const baseSize = Math.min(canvas.width, canvas.height) * 0.8;

      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Apply global zoom
      ctx.scale(currentState.zoom, currentState.zoom);

      // Apply auto-rotation and rotationOffset
      if (currentState.autoRotate) {
        timeRef.current += currentState.rotationSpeed;
      }
      ctx.rotate(timeRef.current + currentState.rotationOffset);

      // Start from a larger scale to ensure the outermost layer is off-screen
      const extraLayers = 5;
      ctx.scale(Math.pow(1 / currentState.scale, extraLayers), Math.pow(1 / currentState.scale, extraLayers));
      
      // Adjust rotation for extra layers
      ctx.rotate(-currentState.rotation * extraLayers);

      drawLayer(ctx, currentState.depth + extraLayers, currentState.zoom * Math.pow(1 / currentState.scale, extraLayers), 0, baseSize, currentState);

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []); // Empty dependency array!

  // Event handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // Scrolling up (deltaY < 0) should zoom in
    const delta = e.deltaY < 0 ? -0.05 : 0.05;
    onZoom(delta);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    onPan(dx, dy);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={onResetCenter}
    />
  );
};
