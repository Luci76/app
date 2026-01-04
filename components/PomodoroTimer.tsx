
import React, { useState, useEffect, useCallback } from 'react';
import { TimerMode } from '../types';

const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(mode === TimerMode.FOCUS ? 25 * 60 : 5 * 60);
  }, [mode]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
      // Automatically toggle mode after one completes
      const nextMode = mode === TimerMode.FOCUS ? TimerMode.BREAK : TimerMode.FOCUS;
      setMode(nextMode);
      setTimeLeft(nextMode === TimerMode.FOCUS ? 25 * 60 : 5 * 60);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center">
      <div className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-widest">
        {mode === TimerMode.FOCUS ? '🔥 Foco Total' : '🌿 Descanso Real'}
      </div>
      <div className="text-6xl font-bold text-slate-800 mb-8 font-mono">
        {formatTime(timeLeft)}
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`px-8 py-3 rounded-full font-semibold transition-all ${
            isActive 
              ? 'bg-slate-100 text-slate-600' 
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700'
          }`}
        >
          {isActive ? 'Pausar' : 'Começar'}
        </button>
        <button 
          onClick={resetTimer}
          className="px-8 py-3 rounded-full font-semibold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Resetar
        </button>
      </div>

      <p className="mt-6 text-sm text-center text-slate-500 max-w-[200px]">
        {mode === TimerMode.FOCUS 
          ? "Desligue as notificações e foque só no agora." 
          : "Levante, beba água e relaxe os olhos."}
      </p>
    </div>
  );
};

export default PomodoroTimer;
