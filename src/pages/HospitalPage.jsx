import React, { useState, useRef } from 'react';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import { Field, Input, Textarea, CatSelector } from '../components/ui/Form';
import { Lightbox } from '../components/ui/Lightbox';
import { uploadImage } from '../lib/supabase';

const getCat = (cats, id) => cats.find(c => c.id === id) || cats[0];

export const HospitalPage = ({ data, activeCat, saveHospitalLog, deleteHospitalLog, addTodo, expandedId, setExpandedId }) => {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newTodo, setNewTodo] = useState("");
  const [form, setForm] = useState({
    cat_id: activeCat === 'all' ? (data.cats[0]?.id || "") : activeCat,
    date: new Date().toISOString().slice(0, 10),
    date: new Date().toISOString().slice(0, 10),
    hospital_name: "", weight: "", purpose: "", treatment: "", aftercare: "", todosToAdd: [], attachments: []
  });

  const searchRef = useRef(null);
  const logRefs = useRef({});
  const cats = data.cats || [];
  const cat = getCat(cats, activeCat) || {};

  React.useEffect(() => {
    if (expandedId && logRefs.current[expandedId]) {
      setTimeout(() => {
        logRefs.current[expandedId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [expandedId]);

  const openSearch = () => { setShowSearch(true); setTimeout(() => searchRef.current?.focus(), 80); };
  const closeSearch = () => { setShowSearch(false); setSearch(""); };

  const logs = data.hospitalLogs
    .filter(l => l.cat_id === activeCat || activeCat === "all")
    .filter(l => !search || [l.purpose, l.treatment, l.aftercare].join(" ").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const weightLogs = data.hospitalLogs.filter(l => l.cat_id === activeCat && l.weight).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      await deleteHospitalLog(form.id);
      setShowForm(false);
      setExpandedId(null);
    }
  };

  const handleSave = async () => {
    if (!form.purpose) return;
    setSaving(true);
    try {
      const urls = await Promise.all((form.attachments || []).map(async (fileObj) => {
        if (typeof fileObj === 'string' && fileObj.startsWith('http')) return fileObj;
        return await uploadImage(fileObj);
      }));

      const { todosToAdd, ...saveData } = form;

      const result = await saveHospitalLog({
        ...saveData,
        weight: parseFloat(form.weight) || null,
        aftercare: form.aftercare || null,
        attachments: urls.filter(u => u)
      });

      const logId = result?.id || form.id;
      if (logId && todosToAdd && todosToAdd.length > 0) {
        for (const text of todosToAdd) {
          if (addTodo) {
            await addTodo({ text, type: "once", cat_id: form.cat_id, source_log_id: logId });
          }
        }
      }

      setShowForm(false);
      setForm({ cat_id: activeCat === 'all' ? (data.cats[0]?.id || "") : activeCat, date: new Date().toISOString().slice(0, 10), hospital_name: "", weight: "", purpose: "", treatment: "", aftercare: "", todosToAdd: [], attachments: [] });
      setNewTodo("");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, attachments: [...(f.attachments || []), ev.target.result] }));
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  return (
    <div className="px-4 pb-28">
      {weightLogs.length > 0 && activeCat !== 'all' && (() => {
        const latest = weightLogs[weightLogs.length - 1];
        const prev = weightLogs[weightLogs.length - 2];
        const delta = prev ? (latest.weight - prev.weight).toFixed(1) : null;
        return (
          <div className="rounded-[18px] p-4 mb-4 border-[1.5px] flex items-center gap-4"
            style={{ backgroundColor: cat.light || '#f9f9f9', borderColor: (cat.accent || '#ccc') + '33' }}>
            <div>
              <p className="m-0 mb-0.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: cat.accent }}>최근 몸무게</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[32px] font-black text-gray-900">{latest.weight}</span>
                <span className="text-[14px] text-gray-400">kg</span>
                {delta !== null && (
                  <span className={`text-[13px] font-bold px-2 py-0.5 rounded-full ${parseFloat(delta) > 0 ? 'bg-red-50 text-red-400' : parseFloat(delta) < 0 ? 'bg-blue-50 text-blue-400' : 'bg-gray-100 text-gray-400'}`}>
                    {parseFloat(delta) > 0 ? "+" : ""}{delta}
                  </span>
                )}
              </div>
              <p className="m-0 mt-1 text-[11px] text-gray-400">{latest.date}</p>
            </div>
            {weightLogs.length >= 2 && (
              <div className="flex-1 mt-1">
                <svg width="100%" height={60} viewBox={`0 0 ${Math.max(200, weightLogs.length * 45)} 60`} preserveAspectRatio="none" className="overflow-visible">
                  {(() => {
                    const minTime = new Date(weightLogs[0].date).getTime();
                    const maxTime = new Date(weightLogs[weightLogs.length - 1].date).getTime();
                    const timeRange = maxTime - minTime || 86400000;

                    const minW = Math.min(...weightLogs.map(l => l.weight));
                    const maxW = Math.max(...weightLogs.map(l => l.weight));
                    const rangeW = maxW - minW || 0.5;
                    const W = Math.max(200, weightLogs.length * 45);

                    const pts = weightLogs.map((l, i) => {
                      const t = new Date(l.date).getTime();
                      const xRatio = timeRange === 0 ? 0.5 : (t - minTime) / timeRange;
                      const x = 20 + xRatio * (W - 40);
                      const y = 42 - ((l.weight - minW) / rangeW) * 32;
                      return { x, y, date: l.date.substring(5).replace('-', '/') };
                    });

                    return (
                      <>
                        <polyline points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={cat.accent || '#000'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        {pts.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3.5} fill={cat.accent || '#000'} opacity={i === pts.length - 1 ? 1 : 0.4} />
                            <text x={p.x} y={56} fontSize="9" fontWeight="bold" textAnchor="middle" fill="#aaa">{p.date}</text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            )}
          </div>
        );
      })()}

      <div className="flex gap-2.5 mb-4 items-center">
        <div className={`flex items-center overflow-hidden transition-all duration-300 ${showSearch ? 'flex-1' : 'w-0'}`}>
          {showSearch && (
            <div className="flex items-center w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-3 gap-2">
              <Icon name="search" size={17} color="#bbb" />
              <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                placeholder="구충, 알러지 등 검색..." className="flex-1 border-none bg-transparent text-[15px] outline-none py-3" />
              <button onClick={closeSearch} className="bg-transparent border-none cursor-pointer p-0.5"><Icon name="x" size={16} color="#ccc" /></button>
            </div>
          )}
        </div>

        {!showSearch && (
          <button onClick={openSearch} className="w-[46px] h-[46px] rounded-xl border-2 border-gray-100 bg-gray-50 flex items-center justify-center cursor-pointer shrink-0">
            <Icon name="search" size={20} color="#aaa" />
          </button>
        )}

        {!showSearch && (
          <button onClick={() => { setForm(f => ({ ...f, cat_id: activeCat === 'all' ? cats[0]?.id : activeCat })); setShowForm(true); }}
            className="flex-1 py-3.5 rounded-xl border-none text-white font-extrabold text-[16px] cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-opacity"
            style={{ backgroundColor: activeCat === 'all' ? '#4B5563' : (cat.accent || '#F4A261'), boxShadow: `0 4px 16px ${activeCat === 'all' ? '#4B556355' : (cat.accent || '#F4A261')}55` }}>
            <Icon name="plus" size={20} color="#fff" /> 병원 기록 추가
          </button>
        )}
      </div>

      {logs.length === 0 && <div className="text-center py-10 text-gray-300"><p className="text-[40px] m-0 mb-2">🏥</p><p className="m-0 font-bold text-sm">기록이 없습니다</p></div>}

      {logs.map(log => {
        const c = getCat(cats, log.cat_id);
        return (
          <div key={log.id} ref={el => logRefs.current[log.id] = el} className="bg-white rounded-[20px] mb-3.5 border-[1.5px] border-gray-50 shadow-sm overflow-hidden transition-all">
            <div className="px-4 py-3 flex items-center justify-between bg-gray-50/50" style={{ backgroundColor: c.light || '#f9f9f9' }}>
              <div className="flex items-center gap-2">
                <span className="text-[18px]">{c.emoji}</span>
                <span className="text-[13px] font-extrabold" style={{ color: c.accent }}>{c.name}</span>
                <span className="text-[13px] text-gray-400">·</span>
                <span className="text-[13px] text-gray-500 font-medium">{log.date}</span>
              </div>
              <div className="flex items-center gap-2">
                {log.weight && <span className="text-white text-[12px] font-extrabold px-3 py-1 rounded-full" style={{ backgroundColor: c.accent }}>{log.weight}kg</span>}
              </div>
            </div>

            {(() => {
              const relatedTodos = (data.careTodos || []).filter(t => t.source_log_id === log.id);
              return (
                <div className="p-4 border-t border-gray-50 bg-white">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="m-0 text-[18px] font-extrabold text-gray-900 leading-tight">{log.purpose}</p>
                      {log.hospital_name && <p className="m-0 mt-1 text-[13px] font-bold text-gray-500">🏥 {log.hospital_name}</p>}
                    </div>
                    <button onClick={() => { setForm({ ...log, weight: log.weight || "", hospital_name: log.hospital_name || "", todosToAdd: [] }); setShowForm(true); }}
                      className="shrink-0 bg-gray-50 hover:bg-gray-100 border-none rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">
                      <Icon name="edit" size={15} color={c.accent || '#888'} />
                    </button>
                  </div>

                  {log.treatment && (
                    <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 mb-4">
                      <p className="m-0 text-[14px] text-gray-700 whitespace-pre-wrap leading-[1.6]">{log.treatment}</p>
                    </div>
                  )}

                  {log.aftercare && (
                    <div className="bg-yellow-50/70 p-3.5 rounded-xl border border-yellow-100 mb-4">
                      <p className="m-0 mb-1 text-[13px] font-bold text-yellow-800">📌 메모</p>
                      <p className="m-0 text-[14px] text-gray-700 whitespace-pre-wrap leading-[1.6]">{log.aftercare}</p>
                    </div>
                  )}

                  {relatedTodos.length > 0 && (
                    <div className="mb-4">
                      <p className="m-0 mb-2 text-[13px] font-bold text-gray-900 flex items-center gap-1.5"><Icon name="check" size={15} color={c.accent || '#F4A261'} />연관된 할 일</p>
                      <div className="flex flex-col gap-1.5 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                        {relatedTodos.map(t => (
                          <div key={t.id} className="flex items-center gap-2.5 text-[13.5px] text-gray-700">
                            <div className={`w-4 h-4 rounded-[4px] border-[1.5px] flex items-center justify-center bg-white ${t.done ? 'border-current' : 'border-gray-300'}`} style={{ color: t.done ? (c.accent || '#F4A261') : undefined }}>
                              {t.done && <Icon name="check" size={11} color="currentColor" />}
                            </div>
                            <span className={t.done ? "line-through text-gray-400" : ""}>{t.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.attachments && log.attachments.length > 0 && (
                    <div className="mb-1">
                      <p className="m-0 mb-2 text-[13px] font-bold text-gray-900 flex items-center gap-1.5"><Icon name="image" size={15} color={c.accent || '#F4A261'} />첨부 사진</p>
                      <div className="flex gap-2 flex-wrap">
                        {log.attachments.map((url, i) => (
                          <div key={i} onClick={() => setLightbox(url)} className="w-[85px] h-[85px] rounded-xl overflow-hidden cursor-zoom-in border-[1.5px] border-gray-100 shrink-0">
                            <img src={url} alt={`첨부${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      })}



      {showForm && (
        <Modal title={form.id ? "병원 기록 수정" : "병원 기록 추가"} onClose={() => setShowForm(false)} accent={cat.accent}>
          <Field label="고양이">
            <CatSelector cats={cats} value={form.cat_id} onChange={v => setForm(f => ({ ...f, cat_id: v }))} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="날짜"><Input type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} /></Field>
            <Field label="몸무게 (kg)"><Input type="number" step="0.1" value={form.weight} onChange={v => setForm(f => ({ ...f, weight: v }))} placeholder="" /></Field>
          </div>
          <Field label="방문 동물병원 (선택)"><Input value={form.hospital_name || ""} onChange={v => setForm(f => ({ ...f, hospital_name: v }))} placeholder="예: 튼튼동물병원" /></Field>
          <Field label="방문 목적"><Input value={form.purpose} onChange={v => setForm(f => ({ ...f, purpose: v }))} placeholder="예: 정기검진, 구충제, 알러지 확인" /></Field>
          <Field label="진료 내용"><Textarea value={form.treatment} onChange={v => setForm(f => ({ ...f, treatment: v }))} placeholder="처방 내용, 검사 항목 등" /></Field>

          <Field label="메모">
            <Textarea value={form.aftercare} onChange={v => setForm(f => ({ ...f, aftercare: v }))} placeholder="추가적인 메모나 주의사항..." rows={2} />
          </Field>

          <Field label="케어 할 일 (케어 목록에 자동 추가됨)">
            <div className="flex gap-2 mb-2">
              <Input value={newTodo} onChange={v => setNewTodo(v)} placeholder="예: 구충제 챙겨먹이기" />
              <button
                onClick={(e) => { e.preventDefault(); if (newTodo.trim()) { setForm(f => ({ ...f, todosToAdd: [...(f.todosToAdd || []), newTodo.trim()] })); setNewTodo(""); } }}
                className="shrink-0 px-4 rounded-xl border-none text-white font-extrabold text-[13px] cursor-pointer shadow-sm transition-all"
                style={{ backgroundColor: activeCat === 'all' ? '#4B5563' : (cat.accent || '#F4A261') }}>
                추가
              </button>
            </div>
            {(form.todosToAdd || []).map((t, i) => (
              <div key={i} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg mb-1.5 border-[1px] border-gray-100">
                <span className="text-[13px] font-bold text-gray-700">{t}</span>
                <button
                  onClick={(e) => { e.preventDefault(); setForm(f => ({ ...f, todosToAdd: f.todosToAdd.filter((_, idx) => idx !== i) })) }}
                  className="bg-transparent border-none p-1 cursor-pointer hover:bg-gray-100 rounded-md">
                  <Icon name="x" size={14} color="#ccc" />
                </button>
              </div>
            ))}
          </Field>

          <Field label="📎 첨부파일 (영수증·기록지 등)">
            <div className="flex gap-2 flex-wrap">
              {(form.attachments || []).map((url, i) => (
                <div key={i} className="relative w-[72px] h-[72px] rounded-xl overflow-hidden border-[1.5px] border-gray-100 shrink-0">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setForm(f => ({ ...f, attachments: f.attachments.filter((_, j) => j !== i) }))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 border-none cursor-pointer flex items-center justify-center">
                    <Icon name="x" size={11} color="#fff" />
                  </button>
                </div>
              ))}
              <label className="w-[72px] h-[72px] rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer shrink-0 gap-1"
                style={{ borderColor: (cat.accent || '#ccc') + '88', backgroundColor: cat.light || '#f9f9f9' }}>
                <Icon name="camera" size={22} color={cat.accent || '#ccc'} />
                <span className="text-[10px] font-bold" style={{ color: cat.accent || '#ccc' }}>추가</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </Field>
          <div className="flex gap-2.5 mt-4">
            {form.id && (
              <button
                onClick={handleDelete}
                className="w-[100px] py-4 rounded-2xl border-none text-red-500 font-extrabold text-[16px] cursor-pointer bg-red-50 hover:bg-red-100 transition-colors">
                삭제
              </button>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-4 rounded-2xl border-none text-white font-extrabold text-[17px] cursor-pointer shadow-lg disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: cat.accent || '#F4A261', boxShadow: `0 6px 20px ${(cat.accent || '#F4A261')}55` }}>
              {saving ? "업로드 중..." : (form.id ? "수정 완료" : "저장하기")}
            </button>
          </div>
        </Modal>
      )}
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
};
