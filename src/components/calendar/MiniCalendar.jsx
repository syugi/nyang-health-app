import React from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameDay, isSameMonth,
  addMonths, subMonths,
} from 'date-fns';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export const MiniCalendar = ({ currentMonth, onMonthChange, selectedDate, onSelectDate, events, accent }) => {
  const today = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day) => {
    const key = format(day, 'yyyy-MM-dd');
    return events.get(key) || [];
  };

  return (
    <div className="bg-white rounded-[20px] border-2 border-gray-50 shadow-sm mb-5 overflow-hidden">
      <div className="p-4 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className="font-extrabold text-[15px] text-gray-900">캘린더</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-xl border-none bg-gray-50 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-100 transition-colors text-[16px] font-bold"
          >‹</button>
          <span className="text-[14px] font-extrabold text-gray-800 min-w-[100px] text-center">
            {format(currentMonth, 'yyyy년 M월')}
          </span>
          <button
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-xl border-none bg-gray-50 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-100 transition-colors text-[16px] font-bold"
          >›</button>
          <button
            onClick={() => { onMonthChange(new Date()); onSelectDate(new Date()); }}
            className="ml-1 px-2.5 py-1 rounded-lg border-none text-[11px] font-bold cursor-pointer transition-colors"
            style={{ backgroundColor: accent + '20', color: accent }}
          >오늘</button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className="text-center text-[11px] font-bold py-1.5"
              style={{ color: i === 0 ? '#e07070' : i === 6 ? '#5aa8cc' : '#aaa' }}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const dayEvents = getEventsForDay(day);
            const uniqueColors = [...new Set(dayEvents.map(e => e.color))].slice(0, 3);
            const dayOfWeek = day.getDay();

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className="flex flex-col items-center py-1 border-none bg-transparent cursor-pointer rounded-xl transition-all relative"
                style={{
                  opacity: isCurrentMonth ? 1 : 0.3,
                }}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-bold transition-all"
                  style={{
                    backgroundColor: isSelected ? accent : 'transparent',
                    color: isSelected ? '#fff' : dayOfWeek === 0 ? '#e07070' : dayOfWeek === 6 ? '#5aa8cc' : '#333',
                    boxShadow: isToday && !isSelected ? `inset 0 0 0 2px ${accent}` : 'none',
                  }}
                >
                  {format(day, 'd')}
                </div>
                <div className="flex gap-[3px] mt-0.5 h-[6px]">
                  {uniqueColors.map((color, i) => (
                    <div key={i} className="w-[5px] h-[5px] rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
