import type { InsightSource, InsightCategory } from '@/types';

export interface InsightItem {
  id: number;
  source: InsightSource;
  category: InsightCategory;
  text: string;
}

export const INSIGHT_POOL: InsightItem[] = [
  {
    id: 1,
    source: 'Beam',
    category: 'LovePath',
    text: 'Attraction without acceptance is infatuation. You have not truly begun the LovePath until the other person has seen an imperfect version of you and chosen to stay.',
  },
  {
    id: 2,
    source: 'Beam',
    category: 'LovePath',
    text: 'Aspiration is the stage most couples never reach — not because they lack love, but because they mistake shared comfort for shared growth. Supporting each other\'s individual dreams is harder than building a life together, and it matters more.',
  },
  {
    id: 3,
    source: 'Beam',
    category: 'Ego',
    text: 'Ego is the silent destroyer of Attachment. The moment one person consistently needs the last word, the most credit, or the most sacrifice from the other, the foundation begins to erode beneath them.',
  },
  {
    id: 4,
    source: 'Beam',
    category: 'Rebuild',
    text: 'Rebuilding after betrayal is not a return to what existed before. It is the construction of something stronger, built on the knowledge of what broke and the deliberate choice to build differently.',
  },
  {
    id: 5,
    source: 'Beam',
    category: 'LovePath',
    text: 'The gap between how much each person loves is not a failure — it is a normal feature of every stage of the LovePath. What matters is not equality in the moment, but shared direction over time.',
  },
  {
    id: 6,
    source: 'Holiday',
    category: 'Stoic',
    text: 'The obstacle in the relationship is the way forward through it. Every communication breakdown, every moment of withdrawal, every betrayal — these are not detours from the path. They are the path itself, demanding a response.',
  },
  {
    id: 7,
    source: 'Holiday',
    category: 'Stoic',
    text: 'Amor fati applied to love: stop asking whether this relationship is what you wanted. Ask what this relationship, exactly as it is, is asking you to become.',
  },
  {
    id: 8,
    source: 'Holiday',
    category: 'Ego',
    text: 'Ego makes you the hero of every story, including the painful ones. But in love, being the hero of your own narrative is precisely what prevents you from truly seeing the other person.',
  },
  {
    id: 9,
    source: 'Chapman',
    category: 'Love Languages',
    text: 'Speaking your own love language to your partner is not love — it is projection. Real love requires learning to speak in a language that is not natural to you, for the sake of someone who receives it.',
  },
  {
    id: 10,
    source: 'Chapman',
    category: 'Love Languages',
    text: 'Acts of Service performed with resentment communicate the opposite of love. The spirit in which an act is done matters as much as the act itself — perhaps more.',
  },
  {
    id: 11,
    source: 'Chapman',
    category: 'Love Languages',
    text: 'Quality Time is not proximity. Two people can share the same space for years and never give each other the focused, undistracted presence that fills a love tank. Time given without attention is just coexistence.',
  },
  {
    id: 12,
    source: 'Holiday',
    category: 'Betrayal',
    text: 'What happened to you is a fact. What it means about your future is a choice. The Stoic does not ignore the wound — they refuse to let the wound write the next chapter.',
  },
];
