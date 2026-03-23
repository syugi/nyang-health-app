import React from 'react';

export const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const icons = {
    home: <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />,
    hospital: <><path d="M4 3v4a8 8 0 0016 0V3" /><path d="M12 11v4a4 4 0 01-4 4H5" /><circle cx="3" cy="19" r="2" /></>,
    food: <><path d="M7 2v20M3 2v7a4 4 0 008 0V2M21 2v13h-4a5 5 0 015-5zM19 15v7" /></>,
    alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></>,
    camera: <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    check: <path d="M20 6L9 17l-5-5" />,
    chevronDown: <path d="M6 9l6 6 6-6" />,
    weight: <><path d="M12 3a4 4 0 014 4H8a4 4 0 014-4z" /><path d="M4 7h16l-2 14H6L4 7z" /></>,
    pill: <path d="M10.5 21.5l-8-8a5 5 0 017.07-7.07l8 8a5 5 0 01-7.07 7.07zM8.5 8.5l7 7" />,
    paw: <><circle cx="9" cy="7" r="1.5" /><circle cx="15" cy="7" r="1.5" /><circle cx="7" cy="12" r="1.5" /><circle cx="17" cy="12" r="1.5" /><path d="M12 22c-3 0-7-3-7-7s4-5 7-5 7 2 7 5-4 7-7 7z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    zoom: <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" /></>,
    vomit: "🤮",
    blood: "🩸",
    other: "❓",
    close: <path d="M18 6L6 18M6 6l12 12" />,
    arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
    cake: <><path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8" /><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1" /><path d="M2 21h20" /><path d="M7 8v2M12 8v2M17 8v2M7 4l.5 2M12 4l.5 2M17 4l.5 2" /></>,
  };
  
  if (typeof icons[name] === 'string') {
    return <span style={{ fontSize: size }}>{icons[name]}</span>;
  }


  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};
