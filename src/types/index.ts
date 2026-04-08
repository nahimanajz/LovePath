// ─── Love Languages ──────────────────────────────────────────────────────────
export type LanguageKey = 'WA' | 'QT' | 'RG' | 'AS' | 'PT';

export const LANGUAGE_LABELS: Record<LanguageKey, string> = {
  WA: 'Words of Affirmation',
  QT: 'Quality Time',
  RG: 'Receiving Gifts',
  AS: 'Acts of Service',
  PT: 'Physical Touch',
};

export interface LanguageScores {
  WA: number;
  QT: number;
  RG: number;
  AS: number;
  PT: number;
}

export interface QuizResult {
  id: number;
  userId: number;
  primary: LanguageKey;
  secondary: LanguageKey;
  scores: LanguageScores;
  completedAt: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  situation: 'building' | 'dating' | 'recovering' | 'starting_over';
  primaryLanguage: string | null;
  languageScores: LanguageScores | null;
  partnerId: number | null;
  avatar: string | null;
  createdAt: string;
}

// ─── LovePath Stages ─────────────────────────────────────────────────────────
export type LovepathStage = 'Attraction' | 'Acceptance' | 'Attachment' | 'Aspiration';

export interface LovepathStageRecord {
  id: number;
  userId: number;
  currentStage: LovepathStage;
  checklist: Record<LovepathStage, boolean[]>;
}

// ─── Compatibility ────────────────────────────────────────────────────────────
export type DimensionKey = 'physical' | 'intellectual' | 'emotional' | 'values' | 'lifeGoals' | 'humor';

export interface DimensionRatings {
  physical: number;
  intellectual: number;
  emotional: number;
  values: number;
  lifeGoals: number;
  humor: number;
}

export interface CompatibilityRecord {
  id: number;
  userId: number;
  ratings: { user: DimensionRatings; partner: DimensionRatings };
}

// ─── Effort Balance ───────────────────────────────────────────────────────────
export type EffortBehavior = 'initiating' | 'listening' | 'planning' | 'support' | 'honesty';

export interface EffortSliders {
  initiating: number;
  listening: number;
  planning: number;
  support: number;
  honesty: number;
}

export interface EffortBalanceRecord {
  id: number;
  userId: number;
  weekOf: string;
  user: EffortSliders;
  partner: EffortSliders;
}

// ─── Trust Circle ─────────────────────────────────────────────────────────────
export type TrustStatus = 'Mutual' | 'Watch' | 'One-sided';

export interface TrustPerson {
  id: number;
  userId: number;
  name: string;
  role: string;
  yourInvestment: number;
  theirInvestment: number;
}

// ─── Obstacles ────────────────────────────────────────────────────────────────
export type ObstaclePhase = 'Perception' | 'Action' | 'Will';

export interface ObstaclePractice {
  id: number;
  text: string;
}

export interface Obstacle {
  id: number;
  phase: ObstaclePhase;
  title: string;
  insight: string;
  practices: ObstaclePractice[];
}

export interface ObstacleRecord {
  id: number;
  userId: number;
  date: string;
  practices: Record<string, boolean>;
}

// ─── Rebuild ─────────────────────────────────────────────────────────────────
export type RebuildBehavior = 'knowing' | 'supporting' | 'championing' | 'leading' | 'investing';

export interface RebuildSliders {
  knowing: number;
  supporting: number;
  championing: number;
  leading: number;
  investing: number;
}

export interface RebuildRecord {
  id: number;
  userId: number;
  user: RebuildSliders;
  partner: RebuildSliders;
}

// ─── Ego Check ────────────────────────────────────────────────────────────────
export interface EgoCheck {
  id: number;
  userId: number;
  date: string;
  patterns: boolean[];
}

// ─── Insights ─────────────────────────────────────────────────────────────────
export type InsightSource = 'Beam' | 'Holiday' | 'Chapman';
export type InsightCategory = 'LovePath' | 'Stoic' | 'Love Languages' | 'Betrayal' | 'Rebuild' | 'Ego';

export interface Insight {
  id: number;
  source: InsightSource;
  category: InsightCategory;
  date: string;
  text: string;
  reflection: string | null;
}

// ─── Partner Invite ───────────────────────────────────────────────────────────
export interface PartnerInvite {
  id: number;
  userId: number;
  code: string;
  expiresAt: string;
  accepted: boolean;
}
