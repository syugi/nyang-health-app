import React, { useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import { Field, Input, Textarea } from '../components/ui/Form';
import { Lightbox } from '../components/ui/Lightbox';
import { PhotoUploader } from '../components/ui/PhotoUploader';
import { uploadImage } from '../lib/supabase';

const FOOD_EMOJIS = ["🐟", "🍖", "🐓", "🐄", "🦐", "🧀", "🌿"];

export const FoodPage = ({ data, saveFoodLog, deleteFoodLog }) => {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    purchase_date: new Date().toISOString().slice(0, 10), 
    name: "", weight_kg: "", qty: 1, price: "", memo: "", photo_url: null 
  });

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      let finalPhotoUrl = form.photo_url;
      if (form.imageFile) {
        const uploadedUrl = await uploadImage(form.imageFile);
        if (uploadedUrl) finalPhotoUrl = uploadedUrl;
      }

      await saveFoodLog({
        ...form,
        weight_kg: parseFloat(form.weight_kg) || null,
        qty: parseInt(form.qty) || 1,
        price: parseInt(form.price) || 0,
        photo_url: finalPhotoUrl
      });
      setShowForm(false);
      setForm({ purchase_date: new Date().toISOString().slice(0, 10), name: "", weight_kg: "", qty: 1, price: "", memo: "", photo_url: null });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      await deleteFoodLog(form.id);
      setShowForm(false);
      setSelected(null);
    }
  };

  const handlePhoto = (val) => {
    // PhotoUploader returns data URL. In proper setup, we'd handle the File
    // For simplicity, we just keep the base64 and extract File in uploadImage
    setForm(f => ({ ...f, photo_url: val, imageFile: val }));
  };

  return (
    <div className="px-4 pb-28">
      <button onClick={() => setShowForm(true)}
              className="w-full py-3.5 rounded-xl border-none text-white font-extrabold text-[16px] cursor-pointer mb-5 flex items-center justify-center gap-2 shadow-sm transition-opacity"
              style={{ backgroundColor: "#84C5D0", boxShadow: "0 6px 20px #84C5D066" }}>
        <Icon name="plus" size={20} color="#fff" /> 사료·간식 추가
      </button>

      {/* Instagram Grid */}
      <div className="grid grid-cols-3 gap-1">
        {(data.foodLogs || []).map((food, i) => (
          <div key={food.id} onClick={() => setSelected(food)}
               className="aspect-square rounded shadow-sm overflow-hidden bg-gray-100 cursor-pointer relative flex items-center justify-center">
            {food.photo_url ? (
              <img src={food.photo_url} alt={food.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: `hsl(${(i * 47) % 360},60%,93%)` }}>
                <span className="text-[28px]">{FOOD_EMOJIS[i % FOOD_EMOJIS.length]}</span>
                <span className="text-[10px] font-bold text-gray-500 text-center px-1 mt-1 leading-tight">{food.name}</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/55 to-transparent pt-4 pb-1.5 px-1.5">
              <p className="m-0 text-[10px] font-bold text-white leading-tight truncate">{food.name}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          {selected.photo_url && (
            <div onClick={() => setLightbox(selected.photo_url)} className="rounded-2xl overflow-hidden mb-4 cursor-zoom-in">
              <img src={selected.photo_url} alt="" className="w-full max-h-[260px] object-cover" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              ["구매일", selected.purchase_date], 
              ["무게", `${selected.weight_kg || 0}kg`], 
              ["수량", `${selected.qty}개`], 
              ["가격", `${selected.price?.toLocaleString()}원`]
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-xl p-3">
                <p className="m-0 text-[11px] text-gray-400 font-bold">{k}</p>
                <p className="m-0 mt-1 text-[16px] font-extrabold text-gray-900">{v}</p>
              </div>
            ))}
          </div>
          {selected.memo && (
            <div className="bg-yellow-50 rounded-xl p-3 border-[1.5px] border-yellow-100/50">
              <p className="m-0 text-[14px] text-gray-700 leading-relaxed">📝 {selected.memo}</p>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button onClick={() => { setForm(selected); setSelected(null); setShowForm(true); }}
                    className="w-full py-3.5 rounded-2xl border-none font-extrabold text-[16px] cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
              수정하기
            </button>
          </div>
        </Modal>
      )}

      {showForm && (
        <Modal title="사료·간식 추가" onClose={() => setShowForm(false)} accent="#84C5D0">
          <PhotoUploader label="📸 제품 사진" value={form.photo_url} onChange={handlePhoto} accent="#84C5D0" />
          <div className="mt-4" />
          <Field label="구매일"><Input type="date" value={form.purchase_date} onChange={v => setForm(f => ({ ...f, purchase_date: v }))} /></Field>
          <Field label="제품명"><Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="예: 로얄캐닌 인도어" /></Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="무게(kg)"><Input type="number" value={form.weight_kg} onChange={v => setForm(f => ({ ...f, weight_kg: v }))} placeholder="2" /></Field>
            <Field label="수량"><Input type="number" value={form.qty} onChange={v => setForm(f => ({ ...f, qty: v }))} placeholder="1" /></Field>
            <Field label="가격(원)"><Input type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} placeholder="48000" /></Field>
          </div>
          <Field label="메모"><Textarea value={form.memo} onChange={v => setForm(f => ({ ...f, memo: v }))} placeholder="두 마리 다 좋아함, 심바만 먹임..." rows={2} /></Field>
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
                    style={{ backgroundColor: "#84C5D0", boxShadow: "0 6px 20px #84C5D055" }}>
              {saving ? "업로드 중..." : (form.id ? "수정 완료" : "저장하기")}
            </button>
          </div>
        </Modal>
      )}

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
};
