import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useNyangData = () => {
  const [data, setData] = useState({
    cats: [],
    hospitalLogs: [],
    careTodos: [],
    foodLogs: [],
    healthLogs: []
  });
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    try {
      const [
        { data: cats },
        { data: hospitalLogs },
        { data: careTodos },
        { data: foodLogs },
        { data: healthLogs }
      ] = await Promise.all([
        supabase.from('cats').select('*').order('created_at', { ascending: true }),
        supabase.from('hospital_logs').select('*').order('date', { ascending: false }),
        supabase.from('care_todos').select('*').order('created_at', { ascending: true }),
        supabase.from('food_logs').select('*').order('purchase_date', { ascending: false }),
        supabase.from('health_logs').select('*').order('datetime', { ascending: false }),
      ]);

      setData({
        cats: cats || [],
        hospitalLogs: hospitalLogs || [],
        careTodos: careTodos || [],
        foodLogs: foodLogs || [],
        healthLogs: healthLogs || []
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cat Actions
  const saveCat = async (catData) => {
    // id가 "new-" 로 시작하거나 없으면 생성, 아니면 수정
    if (!catData.id || String(catData.id).startsWith('new-')) {
      const { id, ...newCat } = catData;
      const { data: result, error } = await supabase.from('cats').insert(newCat).select().single();
      if (!error && result) {
        setData(d => ({ ...d, cats: [...d.cats, result] }));
        return result;
      }
    } else {
      const { error } = await supabase.from('cats').update(catData).eq('id', catData.id);
      if (!error) {
        setData(d => ({
          ...d,
          cats: d.cats.map(c => c.id === catData.id ? { ...c, ...catData } : c)
        }));
      }
    }
  };

  const deleteCat = async (id) => {
    const { error } = await supabase.from('cats').delete().eq('id', id);
    if (!error) {
      setData(d => ({ ...d, cats: d.cats.filter(c => c.id !== id) }));
    }
  };

  // Todo Actions
  const toggleTodo = async (id, done) => {
    const doneDate = done ? new Date().toISOString().slice(0, 10) : null;
    const { error } = await supabase.from('care_todos').update({ done, done_date: doneDate }).eq('id', id);
    if (!error) {
      setData(d => ({
        ...d,
        careTodos: d.careTodos.map(t => t.id === id ? { ...t, done, done_date: doneDate } : t)
      }));
    }
  };

  const addTodo = async (todoData) => {
    const { data: result, error } = await supabase.from('care_todos').insert(todoData).select().single();
    if (!error && result) {
      setData(d => ({ ...d, careTodos: [...d.careTodos, result] }));
      return result;
    }
  };

  const removeTodo = async (id) => {
    const { error } = await supabase.from('care_todos').delete().eq('id', id);
    if (!error) {
      setData(d => ({ ...d, careTodos: d.careTodos.filter(t => t.id !== id) }));
    }
  };

  // Hospital Actions
  const saveHospitalLog = async (logData) => {
    if (!logData.id) {
      const { data: result, error } = await supabase.from('hospital_logs').insert(logData).select().single();
      if (!error && result) {
        setData(d => ({ ...d, hospitalLogs: [result, ...d.hospitalLogs] }));
        return result;
      }
    } else {
      const { data: result, error } = await supabase.from('hospital_logs').update(logData).eq('id', logData.id).select().single();
      if (!error && result) {
        setData(d => ({
          ...d,
          hospitalLogs: d.hospitalLogs.map(l => l.id === logData.id ? { ...l, ...result } : l)
        }));
        return result;
      }
    }
  };

  const deleteHospitalLog = async (id) => {
    const { error } = await supabase.from('hospital_logs').delete().eq('id', id);
    if (!error) setData(d => ({ ...d, hospitalLogs: d.hospitalLogs.filter(l => l.id !== id) }));
  };

  // Food Actions
  const saveFoodLog = async (logData) => {
    if (!logData.id) {
      const { data: result, error } = await supabase.from('food_logs').insert(logData).select().single();
      if (!error && result) {
        setData(d => ({ ...d, foodLogs: [result, ...d.foodLogs] }));
        return result;
      }
    } else {
      const { error } = await supabase.from('food_logs').update(logData).eq('id', logData.id);
      if (!error) {
        setData(d => ({ ...d, foodLogs: d.foodLogs.map(l => l.id === logData.id ? { ...l, ...logData } : l) }));
      }
    }
  };

  const deleteFoodLog = async (id) => {
    const { error } = await supabase.from('food_logs').delete().eq('id', id);
    if (!error) setData(d => ({ ...d, foodLogs: d.foodLogs.filter(l => l.id !== id) }));
  };

  // Health Actions
  const saveHealthLog = async (logData) => {
    if (!logData.id) {
      const { data: result, error } = await supabase.from('health_logs').insert(logData).select().single();
      if (!error && result) {
        setData(d => ({ ...d, healthLogs: [result, ...d.healthLogs] }));
        return result;
      }
    } else {
      const { error } = await supabase.from('health_logs').update(logData).eq('id', logData.id);
      if (!error) {
        setData(d => ({ ...d, healthLogs: d.healthLogs.map(l => l.id === logData.id ? { ...l, ...logData } : l) }));
      }
    }
  };

  const deleteHealthLog = async (id) => {
    const { error } = await supabase.from('health_logs').delete().eq('id', id);
    if (!error) setData(d => ({ ...d, healthLogs: d.healthLogs.filter(l => l.id !== id) }));
  };

  // 1회성 데이터 갱신도 가능하도록 setData 직접 노출
  return { 
    data, loading, loadData, setData, 
    saveCat, deleteCat, 
    toggleTodo, addTodo, removeTodo, 
    saveHospitalLog, deleteHospitalLog,
    saveFoodLog, deleteFoodLog,
    saveHealthLog, deleteHealthLog 
  };
};
