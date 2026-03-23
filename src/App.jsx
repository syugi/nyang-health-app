import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNyangData } from './hooks/useNyangData';
import { Dashboard } from './pages/Dashboard';
import { HospitalPage } from './pages/HospitalPage';
import { AuthPage } from './pages/AuthPage';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { CatProfileModal } from './components/CatProfileModal';
import { GroupManager } from './components/GroupManager';
import { Modal } from './components/ui/Modal';
import { Icon } from './components/ui/Icon';
import { FoodPage } from './pages/FoodPage';
import { IncidentPage } from './pages/IncidentPage';

function App() {
  const { user, loading: authLoading, activeGroupId, groups, signOut } = useAuth();

  const {
    data, loading, saveCat, deleteCat, toggleTodo, addTodo, removeTodo,
    saveHospitalLog, deleteHospitalLog,
    saveFoodLog, deleteFoodLog,
    saveHealthLog, deleteHealthLog
  } = useNyangData(activeGroupId);

  const [tab, setTab] = useState("home");
  const [activeCat, setActiveCat] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [expandedHospitalId, setExpandedHospitalId] = useState(null);
  const [highlightedIncidentId, setHighlightedIncidentId] = useState(null);
  const [showGroupManager, setShowGroupManager] = useState(false);

  // 인증 로딩 중
  if (authLoading) {
    return <div className="flex h-screen items-center justify-center font-bold text-gray-400">로딩 중...</div>;
  }

  // 미인증 → 로그인 페이지
  if (!user) {
    return <AuthPage />;
  }

  const goToHospitalLog = (id) => {
    setTab("hospital");
    setExpandedHospitalId(id);
  };

  const goToIncidentLog = (id) => {
    setTab("incident");
    setHighlightedIncidentId(id);
  };

  if (!loading && data.cats.length > 0 && !activeCat) {
    setActiveCat('all');
  }

  const activeCatObj = data.cats.find(c => c.id === activeCat) || data.cats[0] || {};
  const PAGE_TITLES = { home: "냥타임", hospital: "병원 기록", food: "사료·간식", incident: "건강 기록" };

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-bold text-gray-400">데이터를 불러오는 중...</div>;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      alert('로그아웃 오류: ' + err.message);
    }
  };

  const activeGroup = groups.find(g => g.id === activeGroupId);

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50 relative font-sans text-gray-900 pb-20 box-border">
      <Header
        title={PAGE_TITLES[tab]}
        onSettingsClick={() => setShowSettings(true)}
        accent={activeCatObj.accent}
      />

      {/* 탭 공통된 상단 필터 (홈 제외) */}
      {tab !== "home" && tab !== "food" && data.cats.length > 0 && (
        <div className="flex gap-2 px-4 py-3 pb-1 sticky top-14 z-[400] bg-gray-50/95 backdrop-blur-sm">
          <button onClick={() => setActiveCat('all')}
                  className="px-3 py-1.5 rounded-full border-2 font-bold text-[13px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  style={{
                    borderColor: activeCat === 'all' ? '#4B5563' : "#e8e8e8",
                    backgroundColor: activeCat === 'all' ? '#F3F4F6' : "transparent",
                    color: activeCat === 'all' ? '#4B5563' : "#bbb"
                  }}>
            <span className="text-[15px]">🐾</span>
            전체
          </button>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {data.cats.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)}
                      className="px-3 py-1.5 rounded-full border-2 font-bold text-[13px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      style={{
                        borderColor: activeCat === c.id ? c.accent : "#e8e8e8",
                        backgroundColor: activeCat === c.id ? c.light : "transparent",
                        color: activeCat === c.id ? c.accent : "#bbb"
                      }}>
                {c.avatar_url
                  ? <img src={c.avatar_url} className="w-5 h-5 rounded-full object-cover" alt="" />
                  : <span className="text-[15px]">{c.emoji}</span>}
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-3">
        {tab === "home" && <Dashboard data={data} activeCat={activeCat} setActiveCat={setActiveCat} toggleTodo={toggleTodo} addTodo={addTodo} removeTodo={removeTodo} goToHospitalLog={goToHospitalLog} goToIncidentLog={goToIncidentLog} />}
        {tab === "hospital" && <HospitalPage data={data} activeCat={activeCat} saveHospitalLog={saveHospitalLog} deleteHospitalLog={deleteHospitalLog} addTodo={addTodo} expandedId={expandedHospitalId} setExpandedId={setExpandedHospitalId} />}
        {tab === "food" && <FoodPage data={data} saveFoodLog={saveFoodLog} deleteFoodLog={deleteFoodLog} />}
        {tab === "incident" && <IncidentPage data={data} activeCat={activeCat} saveHealthLog={saveHealthLog} deleteHealthLog={deleteHealthLog} highlightedId={highlightedIncidentId} setHighlightedId={setHighlightedIncidentId} />}
      </div>

      <Navbar activeTab={tab} setActiveTab={setTab} accent={tab === "incident" ? "#e07070" : (activeCatObj.accent || "#F4A261")} />

      {/* Settings Modal */}
      {showSettings && !editingCat && !showGroupManager && (
        <Modal title="설정" onClose={() => setShowSettings(false)}>
          {/* 계정 & 그룹 섹션 */}
          <div className="mb-5 p-4 rounded-2xl bg-white border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="m-0 font-extrabold text-sm text-gray-900">{user.email}</p>
                {activeGroup && (
                  <p className="m-0 text-xs text-gray-400 mt-0.5">
                    {activeGroup.name} · {groups.length}개 그룹
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGroupManager(true)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-600 cursor-pointer"
              >
                그룹 관리
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2.5 rounded-xl border border-red-100 bg-red-50 text-sm font-bold text-red-400 cursor-pointer"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* 고양이 관리 */}
          <div className="text-xs font-bold text-gray-400 mb-2">고양이 관리</div>
          <p className="text-[13px] text-gray-400 m-0 mb-4">탭을 눌러 프로필을 편집하세요.</p>
          {data.cats.map(c => (
            <div key={c.id} onClick={() => setEditingCat(c)}
                 className="flex items-center gap-3.5 p-3 rounded-2xl border-[1.5px] mb-2.5 cursor-pointer"
                 style={{
                   backgroundColor: activeCat === c.id ? c.light : "#fafafa",
                   borderColor: activeCat === c.id ? c.accent + "55" : "#f0f0f0"
                 }}>
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center border-2 shrink-0"
                   style={{ backgroundColor: c.light, borderColor: c.accent + "44" }}>
                {c.avatar_url ? <img src={c.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="text-[26px]">{c.emoji}</span>}
              </div>
              <div className="flex-1">
                <p className="m-0 font-extrabold text-[16px] text-gray-900">{c.name}</p>
              </div>
              <Icon name="edit" size={16} color="#ccc" />
            </div>
          ))}
          <button onClick={() => setEditingCat("new")}
                  className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-300 bg-transparent cursor-pointer font-bold text-[15px] text-gray-400 flex items-center justify-center gap-2 mt-4 hover:bg-gray-50">
            <Icon name="plus" size={18} color="currentColor" /> 고양이 추가
          </button>
        </Modal>
      )}

      {/* Group Manager Modal */}
      {showGroupManager && (
        <GroupManager onClose={() => setShowGroupManager(false)} />
      )}

      {/* Cat Profile Editor */}
      {editingCat && (
        <CatProfileModal
           cat={editingCat === "new" ? {} : editingCat}
           isNew={editingCat === "new"}
           onSave={(catData) => { saveCat(catData); setEditingCat(null); }}
           onDelete={() => { deleteCat(editingCat.id); setEditingCat(null); }}
           onClose={() => setEditingCat(null)}
        />
      )}
    </div>
  );
}

export default App;
