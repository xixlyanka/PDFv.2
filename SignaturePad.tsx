
import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 500;
      canvas.height = 200;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
      }

      return {
          x: clientX - rect.left,
          y: clientY - rect.top
      };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
    if (!hasSignature) setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setHasSignature(false);
      }
  };

  const save = () => {
      if (!hasSignature) return;
      if (canvasRef.current) {
          onSave(canvasRef.current.toDataURL('image/png'));
      }
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full bg-white touch-none cursor-crosshair"
            style={{ minHeight: '200px' }}
        />
        <div className="flex border-t border-gray-200 divide-x divide-gray-200">
            <button 
                onClick={clear}
                className="flex-1 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors"
            >
                <Eraser className="w-4 h-4 mr-2" /> Clear
            </button>
            <button 
                onClick={save}
                disabled={!hasSignature}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center transition-colors ${
                    hasSignature 
                    ? 'text-indigo-600 hover:bg-indigo-50 bg-indigo-50/50' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
            >
                <Check className="w-4 h-4 mr-2" /> Use Signature
            </button>
        </div>
    </div>
  );
};

export default SignaturePad;