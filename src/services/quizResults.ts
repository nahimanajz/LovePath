import { apiFetch } from '../config/api';
import { API } from '../config/api';
import { QuizResult } from '../types';

export const quizService = {
  getByUser: (userId: number) => apiFetch<QuizResult[]>(`${API.quizResults}?userId=${userId}`),
  create: (data: Omit<QuizResult, 'id'>) =>
    apiFetch<QuizResult>(API.quizResults, { method: 'POST', body: JSON.stringify(data) }),
};
