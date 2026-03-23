import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 세션 상태 추적
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadGroups(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadGroups(session.user.id);
      } else {
        setGroups([]);
        setActiveGroupId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadGroups = async (userId) => {
    try {
      const { data: memberships, error } = await supabase
        .from('group_members')
        .select('group_id, role, groups(id, name, invite_code, created_by)')
        .eq('user_id', userId);

      if (error) throw error;

      const userGroups = (memberships || []).map(m => ({
        ...m.groups,
        role: m.role
      }));

      setGroups(userGroups);
      if (userGroups.length > 0 && !activeGroupId) {
        setActiveGroupId(userGroups[0].id);
      }
    } catch (err) {
      console.error('그룹 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const joinGroup = async (inviteCode) => {
    const { data, error } = await supabase.rpc('join_group_by_code', { code: inviteCode });
    if (error) throw error;
    // 그룹 목록 새로고침
    if (user) await loadGroups(user.id);
    return data;
  };

  const switchGroup = (groupId) => {
    setActiveGroupId(groupId);
  };

  const value = {
    user,
    session,
    groups,
    activeGroupId,
    loading,
    signUp,
    signIn,
    signOut,
    joinGroup,
    switchGroup,
    loadGroups,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
