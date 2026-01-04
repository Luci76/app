
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, StudyTask } from './types';
import Onboarding from './components/Onboarding';
import ProgressBar from './components/ProgressBar';
import PomodoroTimer from './components/PomodoroTimer';
import MentorBot from './components/MentorBot';
import { generateSchedule, getDailyCompletionMessage } from './services/geminiService';

const QUICK_ENCOURAGEMENTS = [
  "Boa! Mais um passo dado. ✨",
  "Isso aí! Você está no caminho certo. 🚀",
  "Mandou bem! Conhecimento é poder. 📚",
  "Um de cada vez, e você chegou lá! 💪",
  "Incrível! Sua dedicação é inspiradora. 🌟",
  "Feito! Sinta esse progresso. 🌿"
];

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [dailyCelebration, setDailyCelebration] = useState<string | null>(null);

  // Load state from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('focoLeveProfile');
    const savedTasks = localStorage.getItem('focoLeveTasks');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (profile) localStorage.setItem('focoLeveProfile', JSON.stringify(profile));
    localStorage.setItem('focoLeveTasks', JSON.stringify(tasks));
  }, [profile, tasks]);

  const handleSetupComplete = async (newProfile: UserProfile) => {
    setLoading(true);
    setProfile(newProfile);
    try {
      const initialSchedule = await generateSchedule(newProfile);
      setTasks(initialSchedule);
    } catch (error) {
      console.error("Error generating schedule", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerDailyCelebration = async (currentTasks: StudyTask[]) => {
    try {
      const msg = await getDailyCompletionMessage(currentTasks);
      setDailyCelebration(msg);
    } catch (e) {
      setDailyCelebration("Incrível! Você venceu o dia. Vá descansar! 🏆");
    }
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const newState = !t.completed;
        if (newState) {
          // Show quick encouragement
          const randomMsg = QUICK_ENCOURAGEMENTS[Math.floor(Math.random() * QUICK_ENCOURAGEMENTS.length)];
          setEncouragement(randomMsg);
          setTimeout(() => setEncouragement(null), 3000);
        }
        return { ...t, completed: newState };
      }
      return t;
    });

    setTasks(updatedTasks);

    // Check if all tasks are completed now
    const allDone = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
    if (allDone) {
      triggerDailyCelebration(updatedTasks);
    } else {
      setDailyCelebration(null);
    }
  };

  const progressPercentage = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-slate-700">Organizando seus estudos...</h2>
        <p className="text-slate-500 mt-2">Estamos criando um plano leve e focado para você.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
        <header className="mb-10 text-center mt-12">
          <h1 className="text-4xl font-black text-indigo-600 tracking-tight">FOCO LEVE</h1>
          <p className="text-slate-500 mt-2 font-medium">Estudar sem peso, um dia de cada vez.</p>
        </header>
        <Onboarding onComplete={handleSetupComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative">
      {/* Quick encouragement popup */}
      {encouragement && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-xl font-bold animate-bounce text-center min-w-[200px]">
          {encouragement}
        </div>
      )}

      {/* Daily Celebration Modal-like Section */}
      {dailyCelebration && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-indigo-900/40 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md text-center animate-in zoom-in-95 duration-300">
            <div className="text-6xl mb-6">🏆</div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Meta Batida!</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              {dailyCelebration}
            </p>
            <button 
              onClick={() => setDailyCelebration(null)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              Uhuul! Curtir meu descanso
            </button>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Hoje</h1>
            <p className="text-sm text-slate-500">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
              {profile.studyHours}h/dia
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Schedule */}
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold text-slate-800">Suas Metas Diárias</h2>
              <span className="text-sm font-semibold text-slate-400">{progressPercentage}% concluído</span>
            </div>
            
            <ProgressBar percentage={progressPercentage} />
            
            <div className="mt-8 space-y-4">
              {tasks.length > 0 ? tasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                    task.completed 
                      ? 'bg-emerald-50 border-emerald-100 opacity-60' 
                      : 'bg-white border-slate-50 hover:border-indigo-100 hover:shadow-md'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    task.completed 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'border-slate-300 group-hover:border-indigo-400'
                  }`}>
                    {task.completed && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className={`block text-xs font-bold uppercase tracking-wider ${task.completed ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {task.subject}
                    </span>
                    <p className={`font-semibold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {task.topic}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <p className="text-slate-400">Nenhuma tarefa para hoje. Que tal relaxar?</p>
                </div>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-50 text-center">
              <p className="text-slate-600 italic font-medium">
                {progressPercentage === 100 
                  ? "Incrível! Você venceu o dia. Vá descansar! 🏆" 
                  : "Bom trabalho. Um passo por dia já é progresso. ✨"}
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-xl">
            <h3 className="text-xl font-bold mb-2">Frase do Dia</h3>
            <p className="text-indigo-100 text-lg">
              "Você não precisa estudar mais. Você precisa estudar melhor, com calma e método."
            </p>
          </section>
        </div>

        {/* Right Column: Tools */}
        <div className="space-y-8">
          <PomodoroTimer />
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span>📅</span> Contagem Regressiva
            </h3>
            <div className="text-center">
              <div className="text-4xl font-black text-indigo-600">
                {Math.max(0, Math.ceil((new Date(profile.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase">Dias para o Grande Dia</p>
            </div>
            <button 
              onClick={() => {
                if(window.confirm("Isso irá resetar todo o seu progresso. Tem certeza?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="mt-6 w-full text-xs font-bold text-slate-300 hover:text-red-400 transition-colors uppercase tracking-widest"
            >
              Recomeçar do zero
            </button>
          </div>
        </div>
      </main>

      <MentorBot />
    </div>
  );
};

export default App;
