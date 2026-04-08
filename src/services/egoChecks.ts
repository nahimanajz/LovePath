import { apiFetch } from '../config/api';
import { API } from '../config/api';
import { EgoCheck } from '../types';

export const egoService = {
  getByUser: (userId: number) => apiFetch<EgoCheck[]>(`${API.egoChecks}?userId=${userId}`),
  create: (data: Omit<EgoCheck, 'id'>) =>
    apiFetch<EgoCheck>(API.egoChecks, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<EgoCheck>) =>
    apiFetch<EgoCheck>(`${API.egoChecks}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
