import type { LovepathStage } from '@/types';

export interface StageDefinition {
  stage: LovepathStage;
  description: string;
  warningSign: string;
  checklist: string[];
}

export const LOVEPATH_STAGES: StageDefinition[] = [
  {
    stage: 'Attraction',
    description:
      'Multi-dimensional pull across physical, intellectual, emotional, and spiritual dimensions',
    warningSign:
      'Attraction based on only one dimension does not sustain long-term love',
    checklist: [
      'Physical attraction is mutual',
      'They stimulate your thinking and make you proud',
      'You feel emotionally safe with them',
      'You share core values and beliefs',
      'Neither is only interested in a short-term connection',
    ],
  },
  {
    stage: 'Acceptance',
    description:
      'Honest vulnerability tested — can you be fully yourself and still be loved?',
    warningSign:
      'One-sided acceptance signals imbalance; if you must perform to keep them, acceptance is not achieved',
    checklist: [
      'You can disagree without fear of rejection',
      'They accept your flaws without cataloguing them',
      'You have not hidden your core self to keep them',
      'Their care feels genuine, not performative',
      'You feel no pressure to pretend or perform',
    ],
  },
  {
    stage: 'Attachment',
    description:
      'Commitment, mutual respect, passion — relationship moves from I like you to I choose you',
    warningSign:
      'Ego — one person consistently needing control, the last word, or validation — blocks Attachment entirely',
    checklist: [
      'Mutual respect is consistent — not situational',
      'Passion is reciprocated, not one-sided',
      'Commitment is clearly implied or stated',
      'Conflict is resolved, not suppressed or avoided',
      'Neither person consistently controls decisions',
    ],
  },
  {
    stage: 'Aspiration',
    description:
      "Both people actively support each other's individual dreams, not just shared ones",
    warningSign:
      "If one person's dreams consistently come first and the other's are deprioritised, Aspiration cannot be reached",
    checklist: [
      'You actively know their deepest dreams and goals',
      'They know and actively support yours',
      'Both of your futures are directionally compatible',
      'Neither is consistently shrinking themselves for the other',
      'You both inspire each other to grow individually',
    ],
  },
];
