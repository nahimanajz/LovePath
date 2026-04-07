import { API, apiFetch } from '../config/api';
import type { CompatibilityRecord } from '../types';

export const compatibilityService = {
  getByUser: (userId: number): Promise<CompatibilityRecord[]> =>
    apiFetch<CompatibilityRecord[]>(`${API.compatibility}?userId=${userId}`),

  upsert: (record: Omit<CompatibilityRecord, 'id'> & { id?: number }): Promise<CompatibilityRecord> => {
    if (record.id) {
      return apiFetch<CompatibilityRecord>(`${API.compatibility}/${record.id}`, {
        method: 'PUT',
        body: JSON.stringify(record),
      });
    }
    return apiFetch<CompatibilityRecord>(API.compatibility, {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },
};
