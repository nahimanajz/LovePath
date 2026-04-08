import type { Obstacle } from '@/types';

export const OBSTACLES: Obstacle[] = [
  {
    id: 1,
    phase: 'Perception',
    title: 'Unrequited Feelings',
    insight:
      'Choose not to be harmed — and you won\'t feel harmed. The pain of loving more than you\'re loved is real. But your interpretation of it as permanent damage — that you are not enough — is a choice. Loving deeply reveals your capacity for connection. The obstacle is not the other person; it is your story about what their limitations mean about you.',
    practices: [
      { id: 1, text: 'I have separated the facts (they feel less) from my story (I am not enough)' },
      { id: 2, text: 'I have stopped checking for signs of reciprocity today' },
      { id: 3, text: 'I see their lower capacity as their obstacle, not evidence of my worth' },
      { id: 4, text: 'I have acknowledged that loving deeply makes me stronger, not foolish' },
    ],
  },
  {
    id: 2,
    phase: 'Perception',
    title: 'Comparing Love Levels',
    insight:
      'Both people rarely feel love equally at the same time — Beam confirms this is normal at every LovePath stage. The gap is not proof you are losing; it is an invitation to observe objectively. Stop measuring. Start building.',
    practices: [
      { id: 1, text: 'I have stopped keeping score today' },
      { id: 2, text: 'I understand that love peaks at different times for different people' },
      { id: 3, text: 'I have communicated my depth without demanding matching reciprocity' },
      { id: 4, text: 'I see the gap as a temporary state, not a verdict on the relationship' },
    ],
  },
  {
    id: 3,
    phase: 'Action',
    title: 'Communication Breakdown',
    insight:
      'There is always a countermove, always an escape or a way through. Silence is not safety — it is slow erosion. The action is small and direct: one honest sentence a day changes more than ten perfect conversations you never have.',
    practices: [
      { id: 1, text: 'I said something honest I had been avoiding' },
      { id: 2, text: 'I asked one open question without needing a specific answer' },
      { id: 3, text: 'I replaced a complaint with a desire (I need instead of you never)' },
      { id: 4, text: 'I listened without preparing my defence' },
    ],
  },
  {
    id: 4,
    phase: 'Action',
    title: 'Avoidance and Withdrawal',
    insight:
      "Avoidance feels protective but builds distance. Beam's LovePath requires forward motion: the path cannot be walked standing still. Even one small step matters more than perfect readiness.",
    practices: [
      { id: 1, text: "I took one step toward the relationship today even when I didn't feel ready" },
      { id: 2, text: 'I did not retreat after a moment of vulnerability' },
      { id: 3, text: 'I chose presence over self-protection in at least one moment' },
      { id: 4, text: 'I resisted the impulse to go quiet after conflict' },
    ],
  },
  {
    id: 5,
    phase: 'Action',
    title: 'One Person Carrying Everything',
    insight:
      "When frontal effort fails, change the angle. If direct emotional investment isn't landing, serve their specific needs — their intellectual interests, their practical life, their joy. Change the direction of your effort, not its depth.",
    practices: [
      { id: 1, text: 'I found one thing they care about deeply and supported it today' },
      { id: 2, text: 'I asked about their individual goals — not just our shared ones' },
      { id: 3, text: 'I let them lead something without steering the outcome' },
      { id: 4, text: "I invested in their growth without attaching it to our relationship's health" },
    ],
  },
  {
    id: 6,
    phase: 'Will',
    title: 'Ego and the Need to Win',
    insight:
      "Ego demands that your love be validated, your hurt be acknowledged, your position be won. But something bigger than yourself — the relationship, the other person's growth — dissolves ego. Beam shows ego as the primary blocker of Attachment and Aspiration.",
    practices: [
      { id: 1, text: 'I let something go today without needing to be right' },
      { id: 2, text: 'I named my ego in a moment and chose the relationship instead' },
      { id: 3, text: 'I apologised for impact, not just intention' },
      { id: 4, text: 'I chose curiosity over defensiveness in at least one conversation' },
    ],
  },
  {
    id: 7,
    phase: 'Will',
    title: 'Betrayal and Trust Damage',
    insight:
      "Betrayal reveals the structure beneath a relationship. Your inner citadel — who you are, your values, your self-respect — cannot be taken by anyone else's choices.",
    practices: [
      { id: 1, text: 'I have separated what was done to me from who I am' },
      { id: 2, text: 'I have set one clear boundary without rage or the desire to punish' },
      { id: 3, text: 'I have not used the betrayal as a weapon today' },
      { id: 4, text: 'I asked: what does this teach me about building trust differently?' },
    ],
  },
  {
    id: 8,
    phase: 'Will',
    title: 'Amor Fati — Love What Happened',
    insight:
      'Amor fati: love your fate. Not approval of what happened — refusal to waste it. The betrayal, the imbalance, the pain — these have already happened. They are now raw material.',
    practices: [
      { id: 1, text: 'I have identified one thing the difficulty has taught me' },
      { id: 2, text: 'I have stopped replaying what should have been different' },
      { id: 3, text: 'I see the pain as something that happened for my growth, not as an attack on me' },
      { id: 4, text: 'I have chosen to use this experience as the beginning of something better' },
    ],
  },
];
