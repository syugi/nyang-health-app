import React from 'react';
import { Icon } from '../ui/Icon';

const TABS = [
  { id: 'home', icon: 'home', label: '홈' },
  { id: 'hospital', icon: 'hospital', label: '병원' },
  { id: 'food', icon: 'food', label: '사료' },
  { id: 'incident', icon: 'alert', label: '건강기록' },
];

export const Navbar = ({ activeTab, setActiveTab, accent = "#F4A261" }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 backdrop-blur-md border-t border-gray-100 z-[500] safe-area-bottom px-2">
      <div className="flex justify-between items-center h-[72px]">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 h-full border-none bg-transparent cursor-pointer transition-all">
              <div className={`p-1.5 rounded-full transition-all duration-200 ${isActive ? 'scale-110 mb-0.5' : ''}`}
                   style={{ 
                     color: isActive ? accent : "#ccc", 
                     backgroundColor: isActive ? accent + "15" : "transparent"
                   }}>
                <Icon name={tab.icon} size={isActive ? 22 : 24} color="currentColor" />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? '' : 'text-gray-400'}`}
                    style={{ color: isActive ? accent : undefined }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
