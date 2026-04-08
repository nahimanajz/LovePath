import { apiFetch } from '../config/api';
import { API } from '../config/api';
import { Insight } from '../types';

export const insightsService = {
  getAll: () => apiFetch<Insight[]>(API.insights),
  update: (id: number, data: Partial<Insight>) =>
    apiFetch<Insight>(`${API.insights}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
