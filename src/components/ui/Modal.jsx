import React, { useEffect } from 'react';
import { Icon } from './Icon';

export const Modal = ({ title, onClose, children, accent = "#F4A261" }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/45 z-[1000] flex items-end" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} 
           className="w-full max-h-[92vh] bg-white rounded-t-[28px] flex flex-col overflow-hidden animate-slide-up">
        
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="text-lg font-bold text-gray-900 m-0">{title}</h2>
          <button onClick={onClose} 
                  className="bg-gray-100 border-none rounded-full w-9 h-9 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
            <Icon name="x" size={18} color="#555" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 px-5 pb-9 flex-1 min-h-[30vh]">
          {children}
        </div>
      </div>
    </div>
  );
};
