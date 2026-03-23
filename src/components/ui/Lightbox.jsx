import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

export const Lightbox = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const lastDist = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastDist.current) {
        const delta = dist / lastDist.current;
        setScale(s => Math.min(Math.max(s * delta, 1), 5));
      }
      lastDist.current = dist;
    }
  };

  const handleTouchEnd = () => { lastDist.current = null; };

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center lightbox-overlay"
         onClick={onClose} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <button onClick={onClose} 
              className="absolute top-5 right-5 bg-white/15 border-none rounded-full w-11 h-11 flex items-center justify-center cursor-pointer text-white z-10 hover:bg-white/30 transition-colors">
        <Icon name="x" size={22} color="#fff" />
      </button>
      <img src={src} alt="Enlarged" onClick={e => e.stopPropagation()}
           className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg touch-none transition-transform duration-100"
           style={{ transform: `scale(${scale}) translate(${pos.x}px,${pos.y}px)` }} />
      <p className="absolute bottom-5 text-white/50 text-xs text-center">핀치로 확대 · 탭으로 닫기</p>
    </div>
  );
};
