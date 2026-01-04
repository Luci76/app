
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, StudyTask } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `Você é um mentor calmo, organizado e encorajador para estudantes de Ensino Médio/ENEM. 
Seu objetivo é reduzir a ansiedade e organizar o estudo.
Linguagem: simples, motivadora, curta. 
Evite termos técnicos e pressão. Nunca use frases como "atrasado" ou "deveria estudar mais". 
Sempre use "um passo de cada vez", "vamos ajustar", "ainda dá tempo".`;

export const generateSchedule = async (profile: UserProfile): Promise<StudyTask[]> => {
  const prompt = `Crie um cronograma de estudos para um aluno que quer estudar estas matérias: ${profile.subjects.join(", ")}. 
  A prova é dia ${profile.examDate}. Ele tem ${profile.studyHours} horas por dia. 
  Gere uma lista de 7 tarefas específicas para a primeira semana (uma por dia ou divididas). 
  Mantenha o conteúdo equilibrado e não sobrecarregue. 
  Retorne um array de objetos JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            date: { type: Type.STRING, description: "Data sugerida no formato YYYY-MM-DD" }
          },
          required: ["subject", "topic", "date"]
        }
      }
    }
  });

  const rawData = JSON.parse(response.text || "[]");
  return rawData.map((task: any, index: number) => ({
    ...task,
    id: `task-${Date.now()}-${index}`,
    completed: false
  }));
};

export const getDailyCompletionMessage = async (tasks: StudyTask[]): Promise<string> => {
  const subjects = Array.from(new Set(tasks.map(t => t.subject))).join(", ");
  const prompt = `O estudante acabou de completar todas as suas tarefas de hoje sobre: ${subjects}. 
  Dê um parabéns curto (máximo 2 frases), extremamente caloroso e que valide o esforço dele, reforçando que o descanso agora é merecido.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    }
  });

  return response.text || "Incrível! Você venceu o dia. Vá descansar!";
};

export const getMentorResponse = async (userMessage: string, history: {role: string, parts: any[]}[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [{ text: userMessage }]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    }
  });

  return response.text || "Estou aqui para ajudar. Respire fundo e vamos continuar.";
};
