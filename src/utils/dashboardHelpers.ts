import type { EffortBalanceRecord, TrustPerson } from '../types';

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatTodayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function computeEffortBalance(record: EffortBalanceRecord | undefined): number | null {
  if (!record) return null;
  const userValues = Object.values(record.user);
  const partnerValues = Object.values(record.partner);
  const userAvg = userValues.reduce((a, b) => a + b, 0) / userValues.length;
  const partnerAvg = partnerValues.reduce((a, b) => a + b, 0) / partnerValues.length;
  const total = userAvg + partnerAvg;
  if (total === 0) return 50;
  return Math.round((userAvg / total) * 100);
}

export function countOneSidedTrust(people: TrustPerson[]): number {
  return people.filter((p) => Math.abs(p.yourInvestment - p.theirInvestment) >= 3).length;
}

export function getTodayInsightIndex(total: number): number {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return dayOfYear % total;
}
