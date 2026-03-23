import React, { useState, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Field, Input } from './ui/Form';
import { Icon } from './ui/Icon';
import { uploadImage } from '../lib/supabase';

const ACCENT_POOL = [
  { accent: "#F4A261", light: "#FFF3E8" },
  { accent: "#84C5D0", light: "#E8F7FA" },
  { accent: "#A8D8A8", light: "#EBF7EB" },
  { accent: "#C9A0E0", light: "#F3EAF9" },
  { accent: "#F0A0B0", light: "#FCF0F2" },
  { accent: "#F0C060", light: "#FDF6E0" },
];

const CAT_EMOJIS = ["🐱", "🦁", "🐾", "🐯", "😺", "🙀", "😸", "🐈", "🐈‍⬛"];

export const CatProfileModal = ({ cat, onSave, onDelete, onClose, isNew = false }) => {
  const [form, setForm] = useState({ 
    name: cat.name || '', 
    emoji: cat.emoji || '🐱', 
    avatar_url: cat.avatar_url || null, 
    birthday: cat.birthday || "", 
    accent: cat.accent || "#F4A261", 
    light: cat.light || "#FFF3E8" 
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 로컬 미리보기용 데이터 URL 형식으로 세팅 후, Save 시점에 업로드 처리 (또는 여기서 업로드)
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, avatar_url: ev.target.result, imageFile: file }));
    reader.readAsDataURL(file);
  };

  const calcAge = (birthday) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 12) return `${months}개월`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years}살 ${rem}개월` : `${years}살`;
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      let finalAvatarUrl = form.avatar_url;
      // 만약 새로 선택한 파일이 있으면 스토리지 업로드
      if (form.imageFile) {
        const uploadedUrl = await uploadImage(form.imageFile);
        if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      }
      
      const saveData = {
        ...cat,
        ...form,
        avatar_url: finalAvatarUrl
      };
      delete saveData.imageFile; // 임시 파일 객체 제거
      
      await onSave(saveData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isNew ? "고양이 추가" : "프로필 편집"} onClose={onClose} accent={form.accent}>
      <div className="flex flex-col items-center mb-5">
        <div onClick={() => fileRef.current?.click()} 
             className="w-24 h-24 rounded-full flex items-center justify-center cursor-pointer overflow-hidden relative border-[3px]"
             style={{ background: form.avatar_url ? "transparent" : form.light, borderColor: form.accent }}>
          {form.avatar_url ? (
            <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[44px]">{form.emoji}</span>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black/35 py-1 text-center flex justify-center">
            <Icon name="camera" size={14} color="#fff" />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        {form.avatar_url && (
          <button onClick={() => setForm(f => ({ ...f, avatar_url: null, imageFile: null }))} 
                  className="mt-1.5 text-xs text-gray-400 bg-none border-none cursor-pointer">
            사진 제거
          </button>
        )}
      </div>

      {!form.avatar_url && (
        <Field label="이모지">
          <div className="flex flex-wrap gap-2">
            {CAT_EMOJIS.map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))}
                      className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-[22px] cursor-pointer transition-all"
                      style={{ 
                        borderColor: form.emoji === e ? form.accent : "#e8e8e8",
                        backgroundColor: form.emoji === e ? form.light : "#fafafa" 
                      }}>
                {e}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="이름">
        <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="고양이 이름" />
      </Field>

      <Field label="생일">
        <Input type="date" value={form.birthday} onChange={v => setForm(f => ({ ...f, birthday: v }))} />
        {form.birthday && (
          <p className="mt-1.5 text-[13px] font-bold" style={{ color: form.accent }}>
            🎂 {calcAge(form.birthday)}
          </p>
        )}
      </Field>

      <Field label="테마 색상">
        <div className="flex gap-2.5">
          {ACCENT_POOL.map(p => (
            <button key={p.accent} onClick={() => setForm(f => ({ ...f, accent: p.accent, light: p.light }))}
                    className="w-9 h-9 rounded-full border-[3px] cursor-pointer transition-all"
                    style={{ 
                      backgroundColor: p.accent,
                      borderColor: form.accent === p.accent ? "#333" : "transparent"
                    }} />
          ))}
        </div>
      </Field>

      <button onClick={handleSave} disabled={saving}
              className="w-full py-4 rounded-2xl border-none text-white font-extrabold text-[17px] cursor-pointer mb-3 shadow-lg disabled:opacity-50"
              style={{ backgroundColor: form.accent, boxShadow: `0 6px 20px ${form.accent}55` }}>
        {saving ? "저장 중..." : (isNew ? "추가하기" : "저장하기")}
      </button>

      {!isNew && (
        confirmDelete ? (
          <div className="bg-red-50 rounded-xl p-3.5 text-center">
            <p className="m-0 mb-3 text-sm text-red-700 font-bold">⚠️ {form.name}의 모든 기록이 삭제돼요. 정말요?</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 bg-white font-bold text-gray-500">취소</button>
              <button onClick={() => { onDelete(); onClose(); }} className="flex-1 py-2.5 rounded-xl border-none bg-red-400 text-white font-extrabold">삭제</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="w-full py-3 rounded-xl border-2 border-red-200 bg-transparent text-red-500 font-bold text-sm cursor-pointer flex items-center justify-center gap-1.5">
            <Icon name="trash" size={15} color="currentColor" /> {form.name} 삭제
          </button>
        )
      )}
    </Modal>
  );
};
