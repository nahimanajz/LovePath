import { API, apiFetch } from '../config/api';
import type { RebuildRecord } from '../types';

export const rebuildService = {
  getByUser: (userId: number): Promise<RebuildRecord[]> =>
    apiFetch<RebuildRecord[]>(`${API.rebuild}?userId=${userId}`),

  upsert: (r: Omit<RebuildRecord, 'id'> & { id?: number }): Promise<RebuildRecord> =>
    r.id
      ? apiFetch<RebuildRecord>(`${API.rebuild}/${r.id}`, {
          method: 'PUT',
          body: JSON.stringify(r),
        })
      : apiFetch<RebuildRecord>(API.rebuild, {
          method: 'POST',
          body: JSON.stringify(r),
        }),
};
