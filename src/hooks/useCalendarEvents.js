import { useMemo } from 'react';

const EVENT_CONFIG = {
  hospital: { color: '#5aa8cc', emoji: '🏥' },
  nextVisit: { color: '#F4A261', emoji: '📅' },
  food: { color: '#68a86e', emoji: '🛒' },
  health: { color: '#e07070', emoji: '⚠️' },
  birthday: { color: '#d4a5e5', emoji: '🎂' },
};

const toDateStr = (d) => {
  if (!d) return null;
  return typeof d === 'string' ? d.slice(0, 10) : d.toISOString().slice(0, 10);
};

export const useCalendarEvents = (data, activeCat) => {
  return useMemo(() => {
    const map = new Map();

    const addEvent = (event) => {
      if (!event.date) return;
      const key = event.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    };

    const cats = data.cats || [];
    const getCatName = (id) => cats.find(c => c.id === id)?.name || '';

    // 병원 방문
    (data.hospitalLogs || []).forEach(log => {
      if (activeCat !== 'all' && log.cat_id !== activeCat) return;
      addEvent({
        id: `hospital-${log.id}`,
        date: toDateStr(log.date),
        type: 'hospital',
        color: EVENT_CONFIG.hospital.color,
        emoji: EVENT_CONFIG.hospital.emoji,
        label: log.purpose || '병원 방문',
        detail: log.treatment || '',
        catId: log.cat_id,
        catName: getCatName(log.cat_id),
        sourceId: log.id,
      });

      // 병원 예약 (next_visit)
      if (log.next_visit) {
        addEvent({
          id: `next-visit-${log.id}`,
          date: toDateStr(log.next_visit),
          type: 'nextVisit',
          color: EVENT_CONFIG.nextVisit.color,
          emoji: EVENT_CONFIG.nextVisit.emoji,
          label: '다음 병원 예약',
          detail: log.purpose ? `${log.purpose} 후속` : '',
          catId: log.cat_id,
          catName: getCatName(log.cat_id),
          sourceId: log.id,
        });
      }
    });

    // 사료 구매 (그룹 공유이므로 항상 표시)
    (data.foodLogs || []).forEach(log => {
      addEvent({
        id: `food-${log.id}`,
        date: toDateStr(log.purchase_date),
        type: 'food',
        color: EVENT_CONFIG.food.color,
        emoji: EVENT_CONFIG.food.emoji,
        label: log.name || '사료 구매',
        detail: log.memo || '',
        catId: log.cat_id,
        catName: getCatName(log.cat_id),
        sourceId: log.id,
      });
    });

    // 건강 이상
    (data.healthLogs || []).forEach(log => {
      if (activeCat !== 'all' && log.cat_id !== activeCat) return;
      addEvent({
        id: `health-${log.id}`,
        date: toDateStr(log.datetime),
        type: 'health',
        color: EVENT_CONFIG.health.color,
        emoji: EVENT_CONFIG.health.emoji,
        label: log.type || '건강 이상',
        detail: log.description || '',
        catId: log.cat_id,
        catName: getCatName(log.cat_id),
        sourceId: log.id,
      });
    });

    // 생일 (매년 반복, 항상 표시)
    const currentYear = new Date().getFullYear();
    cats.forEach(cat => {
      if (!cat.birthday) return;
      for (let year = currentYear - 1; year <= currentYear + 1; year++) {
        const bDate = `${year}-${cat.birthday.slice(5)}`;
        addEvent({
          id: `birthday-${cat.id}-${year}`,
          date: bDate,
          type: 'birthday',
          color: EVENT_CONFIG.birthday.color,
          emoji: EVENT_CONFIG.birthday.emoji,
          label: `${cat.name} 생일`,
          detail: `${cat.emoji} ${cat.name}의 생일이에요!`,
          catId: cat.id,
          catName: cat.name,
          sourceId: null,
        });
      }
    });

    return map;
  }, [data, activeCat]);
};
