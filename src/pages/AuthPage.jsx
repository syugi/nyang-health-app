import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function AuthPage() {
  const { signIn, signUp, enterGuestMode } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signUpDone, setSignUpDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName || '냥집사');
        setSignUpDone(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (signUpDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h2>
          <p className="text-gray-500 text-sm mb-6">
            <span className="font-semibold text-gray-700">{email}</span>로 인증 메일을 보냈어요.<br/>
            메일의 링크를 클릭하면 가입이 완료됩니다.
          </p>
          <button
            onClick={() => { setSignUpDone(false); setMode('login'); }}
            className="text-sm font-bold cursor-pointer bg-transparent border-0"
            style={{ color: '#F4A261' }}
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <img src="/pwa-192x192.png" alt="NyangTime" className="w-20 h-20 mx-auto mb-3 rounded-2xl" />
          <h1 className="text-2xl font-extrabold text-gray-900">냥타임</h1>
          <p className="text-sm text-gray-400 mt-1">우리 냥이 건강 관리</p>
        </div>

        {/* 탭 전환 */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold cursor-pointer border-0 transition-all ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-400'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold cursor-pointer border-0 transition-all ${
              mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-400'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">닉네임</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="냥집사"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-300 transition-colors box-border"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="hello@nyang.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-300 transition-colors box-border"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="6자 이상"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-300 transition-colors box-border"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-medium bg-red-50 px-3 py-2 rounded-lg m-0">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl border-0 text-white font-bold text-[15px] cursor-pointer transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#F4A261' }}
          >
            {submitting ? '잠시만요...' : mode === 'login' ? '로그인' : '가입하기'}
          </button>
        </form>

        {/* 게스트 모드 */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-300 font-medium">또는</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <button
          onClick={enterGuestMode}
          className="w-full py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-500 font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors"
        >
          🐾 게스트로 둘러보기
        </button>

      </div>
    </div>
  );
}
