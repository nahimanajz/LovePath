import { apiFetch } from '../config/api';
import { API } from '../config/api';
import { TrustPerson } from '../types';

export const trustService = {
  getByUser: (userId: number) => apiFetch<TrustPerson[]>(`${API.trustCircle}?userId=${userId}`),
  create: (data: Omit<TrustPerson, 'id'>) =>
    apiFetch<TrustPerson>(API.trustCircle, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<TrustPerson>) =>
    apiFetch<TrustPerson>(`${API.trustCircle}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch<void>(`${API.trustCircle}/${id}`, { method: 'DELETE' }),
};
