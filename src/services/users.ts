import { apiFetch } from '../config/api';
import { API } from '../config/api';
import { User } from '../types';

export const usersService = {
  getById: (id: number) => apiFetch<User>(`${API.users}/${id}`),
  update: (id: number, data: Partial<User>) =>
    apiFetch<User>(`${API.users}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
