import React, { useState, useEffect } from 'react';
import { Role, UserSession, AppState, DaySchedule } from './types';
import { getSession, saveSession, clearSession, loadData, saveData, getUpcomingDays, getEmptySchedule, subscribeToChanges } from './services/dataService';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from './services/supabase';
import { Button } from './components/Button';
import { DayCard } from './components/DayCard';
import { APP_NAME } from './constants';
import { LogOut, Heart, Lock, CalendarHeart, Sparkles, X, Cloud, Settings, RefreshCw, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [appData, setAppData] = useState<AppState>({ schedules: {} });
  const [surpriseMode, setSurpriseMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Login Form State
  const [inputKey, setInputKey] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Config State
  const [showConfig, setShowConfig] = useState(false);
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');

  // Load session and config on mount
  useEffect(() => {
    const sbConfig = getSupabaseConfig();
    if (sbConfig) {
      setSbUrl(sbConfig.url);
      setSbKey(sbConfig.key);
    }

    const init = async () => {
      const savedSession = getSession();
      if (savedSession) {
        setSession(savedSession);
        const data = await loadData(savedSession.coupleKey);
        await ensureUpcomingDays(data, savedSession.coupleKey);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!session) return;

    const unsubscribe = subscribeToChanges(session.coupleKey, (newData) => {
      setAppData(newData);
      // Only notify the planner (Boyfriend)
      if (session.role === Role.BOYFRIEND) {
        setToastMessage("Partner updated availability!");
        // Clear toast after 3 seconds
        setTimeout(() => setToastMessage(null), 3000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [session]);

  const ensureUpcomingDays = async (currentData: AppState, key: string) => {
    const days = getUpcomingDays();
    let updated = false;
    const newSchedules = { ...currentData.schedules };

    days.forEach(day => {
      if (!newSchedules[day]) {
        newSchedules[day] = getEmptySchedule(day);
        updated = true;
      }
    });

    if (updated) {
      const newData = { schedules: newSchedules };
      setAppData(newData);
      await saveData(key, newData);
    } else {
      setAppData(currentData);
    }
  };

  const handleLogin = async () => {
    if (!selectedRole || !inputKey.trim()) return;
    setLoading(true);

    // Save Config if provided
    if (sbUrl && sbKey) {
      saveSupabaseConfig({ url: sbUrl.trim(), key: sbKey.trim() });
    } else {
      clearSupabaseConfig();
    }

    const newSession = { role: selectedRole, coupleKey: inputKey.trim() };
    saveSession(newSession.role, newSession.coupleKey);
    setSession(newSession);
    
    // Load data
    const data = await loadData(newSession.coupleKey);
    await ensureUpcomingDays(data, newSession.coupleKey);
    setLoading(false);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setAppData({ schedules: {} });
    setInputKey('');
    setSelectedRole(null);
    setSurpriseMode(false);
  };

  const handleUpdateDay = async (updatedDay: DaySchedule) => {
    if (!session) return;
    setSyncing(true);
    
    // Optimistic Update
    const newData = {
      schedules: {
        ...appData.schedules,
        [updatedDay.date]: updatedDay,
      },
    };
    setAppData(newData);
    
    // Save to backend
    await saveData(session.coupleKey, newData);
    setSyncing(false);
  };

  const handleRefresh = async () => {
    if (!session) return;
    setSyncing(true);
    const data = await loadData(session.coupleKey);
    setAppData(data);
    setSyncing(false);
  }

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  }

  // --- LOGIN SCREEN ---
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6 safe-top safe-bottom">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-lg mb-4">
              <CalendarHeart className="w-10 h-10 text-pink-500" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{APP_NAME}</h1>
            <p className="text-slate-500">Private availability calendar for couples.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSelectedRole(Role.GIRLFRIEND)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedRole === Role.GIRLFRIEND ? 'border-pink-500 bg-pink-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <Heart className={`w-6 h-6 ${selectedRole === Role.GIRLFRIEND ? 'text-pink-500 fill-pink-500' : 'text-slate-400'}`} />
                  <span className={`font-medium ${selectedRole === Role.GIRLFRIEND ? 'text-pink-700' : 'text-slate-600'}`}>I share</span>
                </button>
                <button 
                   onClick={() => setSelectedRole(Role.BOYFRIEND)}
                   className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedRole === Role.BOYFRIEND ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <Sparkles className={`w-6 h-6 ${selectedRole === Role.BOYFRIEND ? 'text-blue-500 fill-blue-500' : 'text-slate-400'}`} />
                  <span className={`font-medium ${selectedRole === Role.BOYFRIEND ? 'text-blue-700' : 'text-slate-600'}`}>I plan</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
               <label className="block text-sm font-medium text-slate-700">Couple Key</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                    type="password" 
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Enter secret key..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                 />
               </div>
            </div>

            {/* Backend Configuration */}
            <div className="border-t border-slate-100 pt-4">
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors w-full"
              >
                <Cloud className="w-4 h-4" />
                {showConfig ? 'Hide Cloud Settings' : 'Setup Cloud Sync (Supabase)'}
              </button>
              
              {showConfig && (
                <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    To sync between devices, create a free project at <a href="https://supabase.com" target="_blank" className="underline text-blue-600">supabase.com</a>.
                  </p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Project URL</label>
                    <input 
                      type="text" 
                      value={sbUrl}
                      onChange={(e) => setSbUrl(e.target.value)}
                      placeholder="https://xyz.supabase.co"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Anon Public Key</label>
                    <input 
                      type="password" 
                      value={sbKey}
                      onChange={(e) => setSbKey(e.target.value)}
                      placeholder="eyJh..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button 
              fullWidth 
              onClick={handleLogin}
              disabled={!selectedRole || !inputKey}
            >
              Enter Calendar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
  const days = getUpcomingDays();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col safe-top">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-[bounce_1s_infinite]">
          <div className="bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-3 text-sm font-medium border border-slate-700/50 backdrop-blur-sm">
            <Bell className="w-4 h-4 text-pink-400 fill-pink-400 animate-pulse" />
            {toastMessage}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {session.role === Role.GIRLFRIEND ? (
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              <Heart className="w-4 h-4 text-pink-600 fill-pink-600" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600" />
            </div>
          )}
          <span className="font-semibold text-slate-900 tracking-tight">{session.role === Role.GIRLFRIEND ? 'My Availability' : 'Planning Mode'}</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleRefresh} 
            className={`p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors ${syncing ? 'animate-spin text-blue-500' : ''}`}
            aria-label="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={handleLogout} 
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 pb-32">
        {session.role === Role.GIRLFRIEND && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl text-blue-900 text-sm mb-6 border border-blue-100 shadow-sm">
             <p>✨ <strong>Tip:</strong> Tap blocks to toggle status. Keeping it updated helps him plan the perfect surprise!</p>
          </div>
        )}

        {/* Calendar List */}
        <div className="space-y-4">
          {days.map((dateStr, index) => {
            const dayData = appData.schedules[dateStr];
            if (!dayData) return null; // Should not happen due to ensureUpcomingDays
            return (
              <DayCard 
                key={dateStr}
                day={dayData}
                role={session.role}
                onUpdate={handleUpdateDay}
                isToday={index === 0}
                surpriseMode={surpriseMode}
              />
            );
          })}
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              SyncHearts • {getSupabaseConfig() ? 'Cloud Synced' : 'Offline Mode'}
            </p>
            <div className="h-4 safe-bottom"></div>
        </div>
      </main>

      {/* Floating Action Bar for Surprise Mode (Boyfriend Only) */}
      {session.role === Role.BOYFRIEND && (
        <div className="fixed bottom-6 left-0 w-full px-4 flex justify-center z-50 pointer-events-none safe-bottom">
          <button 
            onClick={() => setSurpriseMode(!surpriseMode)}
            className={`
              pointer-events-auto
              group flex items-center gap-3 px-6 py-4 rounded-full font-bold shadow-2xl transition-all duration-300 transform active:scale-95
              ${surpriseMode 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white ring-4 ring-purple-200/50 pr-5' 
                : 'bg-white text-slate-800 border border-slate-100 hover:shadow-xl hover:-translate-y-1'
              }
            `}
          >
            <div className={`
              rounded-full p-1 
              ${surpriseMode ? 'bg-white/20' : 'bg-purple-50 text-purple-600'}
            `}>
              {surpriseMode ? (
                <X className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            
            <div className="flex flex-col items-start">
              <span className="text-sm leading-none">
                {surpriseMode ? 'Surprise Mode Active' : 'Plan a Surprise'}
              </span>
              {surpriseMode && (
                <span className="text-[10px] opacity-80 font-normal mt-0.5">Tap to exit</span>
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;