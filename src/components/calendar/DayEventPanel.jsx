import React from 'react';
import { format } from 'date-fns';

export const DayEventPanel = ({ selectedDate, events, goToHospitalLog, goToIncidentLog }) => {
  if (!selectedDate) return null;

  const key = format(selectedDate, 'yyyy-MM-dd');
  const dayEvents = events.get(key) || [];

  const handleClick = (event) => {
    if (event.type === 'hospital' || event.type === 'nextVisit') {
      goToHospitalLog?.(event.sourceId);
    } else if (event.type === 'health') {
      goToIncidentLog?.(event.sourceId);
    }
  };

  return (
    <div className="bg-white rounded-[20px] border-2 border-gray-50 shadow-sm mb-5 overflow-hidden">
      <div className="p-4 px-5">
        <p className="m-0 text-[13px] font-extrabold text-gray-800 mb-3">
          {format(selectedDate, 'M월 d일')} 기록
        </p>

        {dayEvents.length === 0 ? (
          <div className="text-center py-4 text-gray-300">
            <p className="text-2xl m-0 mb-1">📭</p>
            <p className="text-xs m-0 font-bold">이 날의 기록이 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dayEvents.map((event) => {
              const isClickable = event.type === 'hospital' || event.type === 'nextVisit' || event.type === 'health';
              return (
                <div
                  key={event.id}
                  onClick={() => isClickable && handleClick(event)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-[1.5px] transition-all ${isClickable ? 'cursor-pointer hover:border-gray-200 active:scale-[0.98]' : ''}`}
                  style={{ borderColor: event.color + '33', backgroundColor: event.color + '08' }}
                >
                  <span className="text-[20px] shrink-0">{event.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[13px] font-bold text-gray-900">{event.label}</span>
                      {event.catName && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: event.color + '20', color: event.color }}>
                          {event.catName}
                        </span>
                      )}
                    </div>
                    {event.detail && (
                      <p className="m-0 mt-0.5 text-[12px] text-gray-500 truncate">{event.detail}</p>
                    )}
                  </div>
                  {isClickable && (
                    <span className="text-gray-300 text-[14px] shrink-0">›</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
