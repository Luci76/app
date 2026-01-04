
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState(2);
  const [step, setStep] = useState(1);

  const addSubject = () => {
    if (currentSubject.trim()) {
      setSubjects([...subjects, currentSubject.trim()]);
      setCurrentSubject('');
    }
  };

  const handleNext = () => {
    if (step === 1 && subjects.length > 0) setStep(2);
    else if (step === 2 && examDate) setStep(3);
    else if (step === 3) {
      onComplete({
        subjects,
        examDate,
        studyHours,
        setupComplete: true
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl mt-10">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          {step === 1 && "O que você vai estudar?"}
          {step === 2 && "Quando é a prova?"}
          {step === 3 && "Quanto tempo você tem?"}
        </h2>
        <p className="text-slate-500 mt-2">
          {step === 1 && "Liste as matérias que você precisa focar."}
          {step === 2 && "Isso nos ajuda a calcular o ritmo ideal."}
          {step === 3 && "Quantas horas por dia quer dedicar?"}
        </p>
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                placeholder="Ex: Matemática, Redação..."
                className="flex-1 border-2 border-slate-100 rounded-xl px-4 py-2 focus:border-indigo-300 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
              />
              <button 
                onClick={addSubject}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
              >
                +
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s, i) => (
                <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <input 
            type="date" 
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full border-2 border-slate-100 rounded-xl px-4 py-2 focus:border-indigo-300 outline-none"
          />
        )}

        {step === 3 && (
          <div className="space-y-4">
            <input 
              type="range" 
              min="1" 
              max="12" 
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="text-center text-xl font-bold text-slate-700">
              {studyHours} {studyHours === 1 ? 'hora' : 'horas'} por dia
            </div>
          </div>
        )}

        <button 
          onClick={handleNext}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          {step === 3 ? "Começar Agora" : "Próximo"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
