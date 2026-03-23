import React from 'react';

export const Field = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    {children}
  </div>
);

export const Input = ({ value, onChange, type = "text", placeholder, style = {}, className = "" }) => (
  <input 
    type={type} 
    value={value} 
    onChange={e => onChange(e.target.value)} 
    placeholder={placeholder}
    className={`w-full p-3 rounded-xl border-2 border-gray-100 text-[15px] bg-gray-50 outline-none focus:border-nyang-400 focus:bg-white transition-colors ${className}`}
    style={style} 
  />
);

export const Textarea = ({ value, onChange, placeholder, rows = 3, className = "" }) => (
  <textarea 
    value={value} 
    onChange={e => onChange(e.target.value)} 
    placeholder={placeholder} 
    rows={rows}
    className={`w-full p-3 rounded-xl border-2 border-gray-100 text-[15px] bg-gray-50 outline-none resize-none focus:border-nyang-400 focus:bg-white transition-colors ${className}`}
  />
);

export const CatSelector = ({ cats, value, onChange }) => (
  <div className="flex gap-2.5">
    {cats.map(cat => (
      <button key={cat.id} onClick={() => onChange(cat.id)}
        className="flex-1 py-3 rounded-xl border-2 cursor-pointer font-bold text-[15px] transition-all flex items-center justify-center gap-1.5 focus:outline-none"
        style={{ 
          borderColor: value === cat.id ? cat.accent : "#e8e8e8",
          backgroundColor: value === cat.id ? cat.light : "#fafafa",
          color: value === cat.id ? cat.accent : "#aaa",
        }}>
        {cat.avatar_url
          ? <img src={cat.avatar_url} className="w-6 h-6 rounded-full object-cover" alt="" />
          : <span className="text-[20px]">{cat.emoji || '🐱'}</span>}
        {cat.name}
      </button>
    ))}
  </div>
);
