import React from 'react';
import { Icon } from '../ui/Icon';

export const Header = ({ onSettingsClick, title, accent = "#F4A261" }) => {
  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur-md z-[500] h-14 px-4 flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Icon name="paw" size={20} color={accent} />
        <h1 className="text-lg font-extrabold text-gray-900 m-0 tracking-tight">{title}</h1>
      </div>
      
      <button onClick={onSettingsClick} 
              className="w-10 h-10 rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
        <Icon name="settings" size={22} color="currentColor" />
      </button>
    </header>
  );
};
