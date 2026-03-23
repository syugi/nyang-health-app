import React, { useRef } from 'react';
import { Icon } from './Icon';

export const PhotoUploader = ({ label, value, onChange, accent = "#84C5D0" }) => {
  const ref = useRef(null);
  
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    // Alternatively pass File object up if uploading immediately
    reader.readAsDataURL(file);
  };
  
  return (
    <div className="mb-4">
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <div onClick={() => ref.current?.click()}
           className={`relative rounded-2xl min-h-[120px] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 border-2 ${value ? '' : 'border-dashed'}`}
           style={{
             borderColor: value ? accent : "#ddd",
             backgroundColor: value ? "#f0f9fb" : "#fafafa" 
           }}>
        {value ? (
          <img src={value} alt="Preview" className="w-full object-cover max-h-[200px] rounded-xl" />
        ) : (
          <>
            <div className="w-13 h-13 rounded-full flex items-center justify-center mb-2.5" style={{ backgroundColor: accent + "22" }}>
              <Icon name="camera" size={26} color={accent} />
            </div>
            <p className="text-gray-400 text-sm m-0">탭하여 사진 업로드</p>
          </>
        )}
        {value && (
          <button onClick={e => { e.stopPropagation(); onChange(null); }}
                  className="absolute top-2 right-2 bg-black/50 border-none rounded-full w-7 h-7 flex items-center justify-center cursor-pointer z-10 hover:bg-black/70 transition-colors">
            <Icon name="x" size={14} color="#fff" />
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};
