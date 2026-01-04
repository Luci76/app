
export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  completed: boolean;
  date: string; // ISO format
}

export interface UserProfile {
  subjects: string[];
  examDate: string;
  studyHours: number;
  setupComplete: boolean;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export enum TimerMode {
  FOCUS = 'FOCO',
  BREAK = 'PAUSA'
}
