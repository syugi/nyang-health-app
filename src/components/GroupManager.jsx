import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Modal } from './ui/Modal';
import { Icon } from './ui/Icon';

export function GroupManager({ onClose }) {
  const { user, groups, activeGroupId, joinGroup, switchGroup, loadGroups } = useAuth();
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const [members, setMembers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeGroup) {
      setInviteCode(activeGroup.invite_code);
      loadMembers();
    }
  }, [activeGroupId]);

  const loadMembers = async () => {
    if (!activeGroupId) return;
    const { data, error } = await supabase
      .from('group_members')
      .select('user_id, role, joined_at, profiles(display_name)')
      .eq('group_id', activeGroupId);
    if (!error && data) {
      setMembers(data.map(m => ({
        userId: m.user_id,
        role: m.role,
        joinedAt: m.joined_at,
        displayName: m.profiles?.display_name || '냥집사',
      })));
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = inviteCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) return;
    setJoinError('');
    setJoining(true);
    try {
      await joinGroup(joinCode.trim());
      setJoinCode('');
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <Modal title="그룹 관리" onClose={onClose}>
      {/* 현재 그룹 */}
      {activeGroup && (
        <div className="mb-5">
          <div className="text-xs font-bold text-gray-400 mb-2">현재 그룹</div>
          <div className="p-4 rounded-2xl border border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-lg text-gray-900">{activeGroup.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 font-bold"
                    style={{ color: '#F4A261' }}>
                {activeGroup.role === 'owner' ? '관리자' : '멤버'}
              </span>
            </div>

            {/* 초대 코드 */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <div className="text-[10px] text-gray-400 font-bold mb-0.5">초대 코드</div>
                <div className="font-mono font-extrabold text-lg tracking-wider text-gray-800">{inviteCode}</div>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-2 rounded-lg border-0 text-xs font-bold cursor-pointer transition-all"
                style={{
                  backgroundColor: copied ? '#DEF7EC' : '#FFF3E8',
                  color: copied ? '#059669' : '#F4A261'
                }}
              >
                {copied ? '복사됨!' : '복사'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 목록 */}
      <div className="mb-5">
        <div className="text-xs font-bold text-gray-400 mb-2">멤버 ({members.length}명)</div>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.userId}
                 className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">
                {m.userId === user?.id ? '🙋' : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 font-bold text-sm text-gray-800 truncate">
                  {m.displayName}
                  {m.userId === user?.id && <span className="text-gray-400 font-normal"> (나)</span>}
                </p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: m.role === 'owner' ? '#FFF3E8' : '#F3F4F6',
                      color: m.role === 'owner' ? '#F4A261' : '#9CA3AF'
                    }}>
                {m.role === 'owner' ? '관리자' : '멤버'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 그룹 전환 (여러 그룹 소속 시) */}
      {groups.length > 1 && (
        <div className="mb-5">
          <div className="text-xs font-bold text-gray-400 mb-2">내 그룹 목록</div>
          <div className="space-y-2">
            {groups.map(g => (
              <button
                key={g.id}
                onClick={() => switchGroup(g.id)}
                className="w-full text-left p-3 rounded-xl border-2 cursor-pointer bg-white transition-all"
                style={{
                  borderColor: g.id === activeGroupId ? '#F4A261' : '#f0f0f0',
                  backgroundColor: g.id === activeGroupId ? '#FFF9F3' : 'white'
                }}
              >
                <span className="font-bold text-sm">{g.name}</span>
                {g.id === activeGroupId && (
                  <span className="ml-2 text-xs" style={{ color: '#F4A261' }}>현재</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 그룹 참여 */}
      <div>
        <div className="text-xs font-bold text-gray-400 mb-2">다른 그룹에 참여하기</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            placeholder="초대 코드 입력"
            maxLength={8}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none font-mono tracking-wider box-border"
          />
          <button
            onClick={handleJoinGroup}
            disabled={joining || !joinCode.trim()}
            className="px-5 py-3 rounded-xl border-0 text-white font-bold text-sm cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: '#F4A261' }}
          >
            {joining ? '...' : '참여'}
          </button>
        </div>
        {joinError && (
          <p className="text-red-500 text-xs font-medium mt-2 m-0">{joinError}</p>
        )}
      </div>
    </Modal>
  );
}
