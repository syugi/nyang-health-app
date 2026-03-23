import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import { Field, Input, Textarea, CatSelector } from '../components/ui/Form';
import { Lightbox } from '../components/ui/Lightbox';
import { PhotoUploader } from '../components/ui/PhotoUploader';
import { uploadImage } from '../lib/supabase';

const SYMPTOM_TYPES = [
  { type: "구토", emoji: "🤮", color: "#e8956a" },
  { type: "배설이상", emoji: "🚽", color: "#e07070" },
  { type: "식욕부진", emoji: "🍽️", color: "#b0b0b0" },
  { type: "기력저하", emoji: "😴", color: "#9db8c7" },
  { type: "기타", emoji: "❓", color: "#aaa" },
];

const getCat = (cats, id) => cats.find(c => c.id === id) || cats[0];

export const IncidentPage = ({ data, activeCat, saveHealthLog, deleteHealthLog, highlightedId, setHighlightedId }) => {
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [saving, setSaving] = useState(false);

  // datetime-local inputs require YYYY-MM-DDTHH:mm format
  const nowStr = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const [form, setForm] = useState({
    cat_id: activeCat === 'all' ? (data.cats[0]?.id || "") : activeCat,
    datetime: nowStr, type: "구토", photo_url: null, description: ""
  });

  const searchRef = useRef(null);
  const logRefs = useRef({});
  const cats = data.cats || [];
  const cat = getCat(cats, activeCat) || {};

  useEffect(() => {
    if (highlightedId && logRefs.current[highlightedId]) {
      setTimeout(() => {
        logRefs.current[highlightedId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => setHighlightedId && setHighlightedId(null), 1500);
      }, 100);
    }
  }, [highlightedId, setHighlightedId]);

  const incidents = (data.healthLogs || [])
    .filter(i => activeCat === 'all' || i.cat_id === activeCat)
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalPhotoUrl = null;
      // If we already have a public URL (editing), use it
      if (form.photo_url && form.photo_url.startsWith('http')) {
        finalPhotoUrl = form.photo_url;
      }
      
      // Upload a new image if there's one
      if (form.imageFile) {
        const uploadedUrl = await uploadImage(form.imageFile);
        if (uploadedUrl) {
          finalPhotoUrl = uploadedUrl;
        } else {
          alert('사진 업로드 권한 또는 저장 공간(Storage)이 준비되지 않았습니다. 사진 없이 기록됩니다.');
        }
      }

      const saveData = { ...form, photo_url: finalPhotoUrl };
      delete saveData.imageFile;

      await saveHealthLog(saveData);
      setShowForm(false);
      setForm({ cat_id: activeCat, datetime: nowStr, type: "구토", photo_url: null, description: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      await deleteHealthLog(form.id);
      setShowForm(false);
    }
  };

  const handlePhoto = (val) => {
    setForm(f => ({ ...f, photo_url: val, imageFile: val }));
  };

  return (
    <div className="px-4 pb-28">
      <button onClick={() => { setForm(f => ({ ...f, cat_id: activeCat === 'all' ? data.cats[0]?.id : activeCat })); setShowForm(true); }}
        className="w-full py-3.5 rounded-xl border-none text-white font-extrabold text-[16px] cursor-pointer mb-5 flex items-center justify-center gap-2 shadow-sm transition-opacity"
        style={{ backgroundColor: "#e07070", boxShadow: "0 6px 20px #e0707066" }}>
        <Icon name="alert" size={20} color="#fff" /> 건강 기록 추가
      </button>

      {incidents.length === 0 && (
        <div className="text-center py-10 text-gray-300">
          <p className="text-[50px] m-0 mb-2">😸</p>
          <p className="m-0 font-bold text-sm">건강 이상 기록이 없습니다</p>
        </div>
      )}

      {incidents.map(inc => {
        const c = getCat(cats, inc.cat_id);
        const sym = SYMPTOM_TYPES.find(s => s.type === inc.type) || SYMPTOM_TYPES[SYMPTOM_TYPES.length - 1];

        return (
          <div key={inc.id} ref={el => logRefs.current[inc.id] = el} className={`bg-white rounded-[20px] mb-3.5 border-[1.5px] shadow-sm overflow-hidden transition-all duration-500 ${highlightedId === inc.id ? 'ring-2 ring-[#e07070] scale-[1.02]' : ''}`}
            style={{ borderColor: sym.color + "33" }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: sym.color + "15" }}>
              <div className="flex items-center gap-2.5">
                <span className="text-[24px]">{sym.emoji}</span>
                <div>
                  <div className="font-extrabold text-[15px] text-gray-900">{sym.type}</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">
                    {c.emoji} {c.name} · {(inc.datetime || '').replace("T", " ").substring(0, 16)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setForm(inc); setShowForm(true); }}
                className="bg-white/70 hover:bg-white border-none rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Icon name="edit" size={14} color={sym.color || '#ccc'} />
              </button>
            </div>
            <div className="p-4">
              <p className="m-0 text-[14px] text-gray-600 leading-relaxed">{inc.description}</p>
              {inc.photo_url && (
                <div onClick={() => setLightbox(inc.photo_url)} className="mt-3 rounded-xl overflow-hidden cursor-zoom-in w-[100px] h-[100px] border-[1.5px] border-gray-100">
                  <img src={inc.photo_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {showForm && (
        <Modal title="건강 기록 추가" onClose={() => setShowForm(false)} accent="#e07070">
          <Field label="고양이">
            <CatSelector cats={data.cats} value={form.cat_id} onChange={v => setForm(f => ({ ...f, cat_id: v }))} />
          </Field>
          <Field label="발생 일시">
            <Input type="datetime-local" value={form.datetime} onChange={v => setForm(f => ({ ...f, datetime: v }))} />
          </Field>
          <Field label="증상 유형">
            <div className="flex gap-2 flex-wrap">
              {SYMPTOM_TYPES.map(s => (
                <button key={s.type} onClick={() => setForm(f => ({ ...f, type: s.type }))}
                  className="px-3.5 py-2.5 rounded-xl border-2 font-bold text-[14px] cursor-pointer transition-all flex items-center gap-1.5"
                  style={{
                    borderColor: form.type === s.type ? s.color : "#e8e8e8",
                    backgroundColor: form.type === s.type ? s.color + "20" : "#fafafa",
                    color: form.type === s.type ? s.color : "#bbb"
                  }}>
                  <span className="text-[18px]">{s.emoji}</span>{s.type}
                </button>
              ))}
            </div>
          </Field>
          <PhotoUploader label="📷 증상 사진" value={form.photo_url} onChange={handlePhoto} accent="#e07070" />
          <div className="mt-4" />
          <Field label="상세 설명">
            <Textarea value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="언제부터, 어떤 상황에서, 어떤 증상이..." rows={4} />
          </Field>
          <div className="flex gap-2">
            {form.id && (
              <button onClick={handleDelete}
                className="w-[100px] py-4 rounded-2xl border-none text-red-500 font-extrabold text-[16px] cursor-pointer mt-2 bg-red-50 hover:bg-red-100 transition-colors">
                삭제
              </button>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-4 rounded-2xl border-none text-white font-extrabold text-[16px] cursor-pointer mt-2 shadow-lg disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: "#e07070", boxShadow: "0 6px 20px #e0707055" }}>
              {saving ? "업로드 중..." : (form.id ? "수정 완료" : "저장하기")}
            </button>
          </div>
        </Modal>
      )}
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
};
