const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export const API = {
  base: BASE_URL,
  users:          `${BASE_URL}/users`,
  quizResults:    `${BASE_URL}/quizResults`,
  effortBalance:  `${BASE_URL}/effortBalance`,
  trustCircle:    `${BASE_URL}/trustCircle`,
  lovepathStage:  `${BASE_URL}/lovepathStage`,
  compatibility:  `${BASE_URL}/compatibility`,
  obstacles:      `${BASE_URL}/obstacles`,
  rebuild:        `${BASE_URL}/rebuild`,
  egoChecks:      `${BASE_URL}/egoChecks`,
  insights:       `${BASE_URL}/insights`,
  reflections:    `${BASE_URL}/reflections`,
  partnerInvites: `${BASE_URL}/partnerInvites`,
} as const;

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
