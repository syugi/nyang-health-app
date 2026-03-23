import React, { useState, useRef } from 'react';
import { Icon } from '../components/ui/Icon';

const getCat = (cats, id) => cats.find(c => c.id === id) || cats[0];

const CareSection = ({ data, activeCat, toggleTodo, addTodo, removeTodo }) => {
  const cat = getCat(data.cats, activeCat) || {};
  const todos = data.careTodos.filter(t => activeCat === 'all' || t.cat_id === activeCat) || [];
  const [addText, setAddText] = useState("");
  const [addType, setAddType] = useState("once");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCatForAdd, setSelectedCatForAdd] = useState(activeCat === 'all' ? data.cats[0]?.id : activeCat);
  const inputRef = useRef(null);

  React.useEffect(() => {
    setSelectedCatForAdd(activeCat === 'all' ? data.cats[0]?.id : activeCat);
  }, [activeCat, data.cats]);

  const pending = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);
  const pendingOnce = pending.filter(t => t.type === "once");
  const pendingRoutine = pending.filter(t => t.type === "routine");

  const handleAdd = () => {
    if (!addText.trim() || !selectedCatForAdd) return;
    addTodo({ text: addText.trim(), type: addType, cat_id: selectedCatForAdd });
    setAddText("");
    setShowAdd(false);
  };

  const TodoItem = ({ todo }) => {
    const isHospital = !!todo.source_log_id;
    return (
      <div className="flex items-start gap-2.5 py-3 border-b border-gray-100 last:border-0">
        <button onClick={() => toggleTodo(todo.id, !todo.done)}
          className="shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer"
          style={{
            borderColor: todo.done ? cat.accent : "#ddd",
            backgroundColor: todo.done ? cat.accent : "transparent"
          }}>
          {todo.done && <Icon name="check" size={13} color="#fff" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[14px] leading-snug ${todo.done ? 'font-normal text-gray-400 line-through' : 'font-bold text-gray-800'}`}>
              {todo.text}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: todo.type === "routine" ? "#e8f4fb" : "#f0f8f0",
                color: todo.type === "routine" ? "#5aa8cc" : "#68a86e",
              }}>
              {todo.type === "routine" ? "🔄 반복" : "✅ 1회"}
            </span>
            {isHospital && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: cat.light, color: cat.accent }}>
                🏥 병원
              </span>
            )}
          </div>
          {todo.done && todo.done_date && (
            <p className="m-0 mt-0.5 text-[11px] text-gray-400">{todo.done_date} 완료</p>
          )}
        </div>

        <button onClick={() => removeTodo(todo.id)} className="shrink-0 bg-transparent border-none p-1 cursor-pointer hover:bg-gray-50 rounded-md">
          <Icon name="x" size={16} color="#ccc" />
        </button>
      </div>
    );
  };

  const pendingCount = pending.length;

  return (
    <div className="bg-white rounded-[20px] border-2 border-gray-50 shadow-sm mb-5 overflow-hidden">
      <div className="p-4 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <span className="font-extrabold text-[15px] text-gray-900">케어 할 일</span>
          {pendingCount > 0 && (
            <span className="w-5 h-5 rounded-full text-[11px] font-extrabold text-white flex items-center justify-center"
              style={{ backgroundColor: cat.accent || '#F4A261' }}>
              {pendingCount}
            </span>
          )}
        </div>
        <button onClick={() => { setShowAdd(v => !v); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="w-8 h-8 rounded-xl border-none flex items-center justify-center cursor-pointer transition-colors"
          style={{ backgroundColor: cat.light || '#FFF3E8', color: cat.accent || '#F4A261' }}>
          <Icon name="plus" size={18} color="currentColor" />
        </button>
      </div>

      {showAdd && (
        <div className="mx-4 mb-2 p-3.5 rounded-2xl" style={{ backgroundColor: cat.light || '#FFF3E8' }}>
          {activeCat === 'all' && (
            <select value={selectedCatForAdd} onChange={e => setSelectedCatForAdd(e.target.value)}
              className="w-full mb-2 p-2 rounded-lg text-sm border-none outline-none font-bold text-gray-700 bg-white/60">
              {data.cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          )}
          <input ref={inputRef} value={addText} onChange={e => setAddText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="할 일 입력..." className="w-full border-none bg-transparent text-sm outline-none mb-3 font-medium placeholder-gray-400" />
          <div className="flex gap-2 items-center">
            <button onClick={() => setAddType("once")}
              className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold cursor-pointer"
              style={{
                borderColor: addType === "once" ? cat.accent : "#ddd",
                backgroundColor: addType === "once" ? cat.accent : "#fff",
                color: addType === "once" ? "#fff" : "#aaa"
              }}>✅ 1회성</button>
            <button onClick={() => setAddType("routine")}
              className="px-3 py-1.5 rounded-xl border-2 text-xs font-bold cursor-pointer"
              style={{
                borderColor: addType === "routine" ? cat.accent : "#ddd",
                backgroundColor: addType === "routine" ? cat.accent : "#fff",
                color: addType === "routine" ? "#fff" : "#aaa"
              }}>🔄 반복 루틴</button>
            <button onClick={handleAdd} className="ml-auto px-4 py-1.5 rounded-xl border-none text-white text-xs font-extrabold cursor-pointer"
              style={{ backgroundColor: cat.accent }}>추가</button>
          </div>
        </div>
      )}

      <div className="px-5 pb-2">
        {pendingRoutine.length > 0 && (
          <>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-3 mb-1">🔄 반복 루틴</p>
            {pendingRoutine.map(t => <TodoItem key={t.id} todo={t} />)}
          </>
        )}
        {pendingOnce.length > 0 && (
          <>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-3 mb-1">✅ 처리 필요</p>
            {pendingOnce.map(t => <TodoItem key={t.id} todo={t} />)}
          </>
        )}
        {pendingCount === 0 && (
          <div className="text-center py-6 text-gray-300">
            <p className="text-3xl m-0 mb-1">🎉</p>
            <p className="text-xs m-0 font-bold">모두 완료했어요!</p>
          </div>
        )}
        {done.length > 0 && (
          <details className="mt-2 outline-none group">
            <summary className="text-xs font-bold text-gray-400 cursor-pointer py-2 flex items-center gap-1 list-none outline-none">
              <span className="transition-transform group-open:rotate-180 flex"><Icon name="chevronDown" size={14} color="#ccc" /></span> 완료 {done.length}개
            </summary>
            {done.map(t => <TodoItem key={t.id} todo={t} />)}
          </details>
        )}
      </div>
      <div className="h-3" />
    </div>
  );
};

export const Dashboard = ({ data, activeCat, setActiveCat, toggleTodo, addTodo, removeTodo, goToHospitalLog, goToIncidentLog }) => {
  const cats = data.cats || [];
  const cat = getCat(cats, activeCat) || {};
  const logs = data.hospitalLogs.filter(l => activeCat === 'all' || l.cat_id === activeCat).sort((a, b) => new Date(b.date) - new Date(a.date));
  const incidents = data.healthLogs.filter(i => activeCat === 'all' || i.cat_id === activeCat).slice(0, 2);

  const calcAge = (birthday) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months}개월`;
    const y = Math.floor(months / 12), m = months % 12;
    return m > 0 ? `${y}살 ${m}개월` : `${y}살`;
  };

  return (
    <div className="px-4 pb-28">
      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-1 no-scrollbar">
        <button onClick={() => setActiveCat('all')}
          className="shrink-0 min-w-[90px] p-3 rounded-[20px] border-2 cursor-pointer transition-all flex flex-col items-center"
          style={{
            borderColor: activeCat === 'all' ? "transparent" : "#e0e0e0",
            backgroundColor: activeCat === 'all' ? '#4B5563' : "#fafafa",
            boxShadow: activeCat === 'all' ? `0 4px 20px #4B556355` : "none"
          }}>
          <div className="w-11 h-11 rounded-full mb-1.5 overflow-hidden flex items-center justify-center border-2 transition-colors"
            style={{
              backgroundColor: activeCat === 'all' ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
              borderColor: activeCat === 'all' ? 'rgba(255,255,255,0.4)' : 'transparent'
            }}>
            <span className="text-[20px]">🐾</span>
          </div>
          <div className={`font-extrabold text-[14px] ${activeCat === 'all' ? "text-white" : "text-gray-400"}`}>전체</div>
        </button>
        {cats.map(c => (
          <button key={c.id} onClick={() => setActiveCat(c.id)}
            className="shrink-0 min-w-[90px] p-3 rounded-[20px] border-2 cursor-pointer transition-all flex flex-col items-center"
            style={{
              borderColor: activeCat === c.id ? "transparent" : "#e0e0e0",
              backgroundColor: activeCat === c.id ? c.accent : "#fafafa",
              boxShadow: activeCat === c.id ? `0 4px 20px ${c.accent}55` : "none"
            }}>
            <div className="w-11 h-11 rounded-full mb-1.5 overflow-hidden flex items-center justify-center border-2 border-white/40"
              style={{ backgroundColor: c.light }}>
              {c.avatar_url
                ? <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                : <span className="text-[24px]">{c.emoji}</span>}
            </div>
            <div className={`font-extrabold text-[14px] ${activeCat === c.id ? "text-white" : "text-gray-400"}`}>{c.name}</div>
            {c.birthday && <div className={`text-[10px] mt-0.5 ${activeCat === c.id ? "text-white/80" : "text-gray-300"}`}>{calcAge(c.birthday)}</div>}
          </button>
        ))}
      </div>

      <CareSection data={data} activeCat={activeCat} toggleTodo={toggleTodo} addTodo={addTodo} removeTodo={removeTodo} />

      <h3 className="text-[15px] font-extrabold text-gray-800 my-5 flex items-center gap-1.5">
        <Icon name="hospital" size={16} color={cat.accent || '#F4A261'} /> 최근 병원 기록
      </h3>
      {logs.length === 0 && <p className="text-gray-400 text-sm text-center py-4">기록 없음</p>}
      {logs.slice(0, 2).map(log => {
        const c = getCat(cats, log.cat_id);
        return (
          <div key={log.id} onClick={() => goToHospitalLog(log.id)} className="bg-white rounded-2xl p-4 mb-2.5 shadow-sm border-[1.5px] border-gray-50 relative overflow-hidden cursor-pointer transition-transform active:scale-[0.98] hover:border-gray-100">
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-1.5">
                {activeCat === 'all' && <span className="text-[14px]">{c.emoji}</span>}
                <span className="text-[13px] font-bold" style={{ color: c.accent || cat.accent }}>{log.date}</span>
              </div>
              {log.weight && <span className="text-[12px] px-2.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: c.light || cat.light, color: c.accent || cat.accent }}>{log.weight}kg</span>}
            </div>
            <p className="mt-1.5 mb-0.5 text-[15px] font-bold text-gray-900 relative z-10">{log.purpose}</p>
            <p className="m-0 text-[13px] text-gray-500 relative z-10">{log.treatment}</p>
            {log.aftercare && (
              <div className="mt-2.5 p-2 rounded-xl text-xs font-bold relative z-10" style={{ backgroundColor: c.light || cat.light, color: c.accent || cat.accent }}>
                💊 {log.aftercare}
              </div>
            )}
            {activeCat === 'all' && (
              <div className="absolute -right-2 -bottom-2 opacity-5 pointer-events-none transition-transform group-hover:scale-110" style={{ color: c.accent, fontSize: '100px', lineHeight: 1 }}>{c.emoji}</div>
            )}
          </div>
        );
      })}

      {incidents.length > 0 && (
        <>
          <h3 className="text-[15px] font-extrabold text-gray-800 mt-7 mb-4 flex items-center gap-1.5">
            <Icon name="alert" size={16} color="#e07070" /> 최근 건강 기록
          </h3>
          {incidents.map(inc => {
            const symC = getCat(cats, inc.cat_id);
            return (
              <div key={inc.id} onClick={() => goToIncidentLog(inc.id)} className="bg-red-50 rounded-2xl p-4 mb-2.5 border-[1.5px] border-red-100 relative overflow-hidden cursor-pointer transition-transform active:scale-[0.98] hover:border-red-200">
                <div className="flex items-center gap-2 relative z-10">
                  <span className="text-[22px]">{inc.type === "구토" ? "🤮" : inc.type === "혈변" ? "🩸" : "❓"}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      {activeCat === 'all' && <span className="text-[11px] font-bold" style={{ color: symC.accent }}>{symC.emoji} {symC.name}</span>}
                      <p className="m-0 text-[14px] font-bold text-gray-900">{inc.type}</p>
                    </div>
                    <p className="m-0 text-[12px] text-gray-400">{(inc.datetime || '').replace("T", " ").substring(0, 16)}</p>
                  </div>
                </div>
                <p className="mt-2 mb-0 text-[13px] text-gray-600 relative z-10">{inc.description}</p>
                {activeCat === 'all' && (
                  <div className="absolute -right-2 -bottom-2 opacity-5 pointer-events-none transition-transform group-hover:scale-110" style={{ color: '#e07070', fontSize: '100px', lineHeight: 1 }}>{symC.emoji}</div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};
