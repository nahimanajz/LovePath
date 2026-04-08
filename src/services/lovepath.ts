import { apiFetch } from '../config/api';
import { API } from '../config/api';
import { LovepathStageRecord } from '../types';

export const lovepathService = {
  getByUser: (userId: number) => apiFetch<LovepathStageRecord[]>(`${API.lovepathStage}?userId=${userId}`),
  update: (id: number, data: Partial<LovepathStageRecord>) =>
    apiFetch<LovepathStageRecord>(`${API.lovepathStage}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
