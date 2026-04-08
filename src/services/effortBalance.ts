import { apiFetch } from '../config/api';
import { API } from '../config/api';
import { EffortBalanceRecord } from '../types';

export const effortService = {
  getByUser: (userId: number) => apiFetch<EffortBalanceRecord[]>(`${API.effortBalance}?userId=${userId}`),
  upsert: (data: Omit<EffortBalanceRecord, 'id'> & { id?: number }) =>
    data.id
      ? apiFetch<EffortBalanceRecord>(`${API.effortBalance}/${data.id}`, { method: 'PUT', body: JSON.stringify(data) })
      : apiFetch<EffortBalanceRecord>(API.effortBalance, { method: 'POST', body: JSON.stringify(data) }),
};
