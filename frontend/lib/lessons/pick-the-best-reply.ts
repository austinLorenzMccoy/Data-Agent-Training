import type { Lesson } from './types'

// Guideline video for /prep/replies. Examples are written for the video and
// differ from the question bank.

export const PICK_THE_BEST_REPLY: Lesson = {
  id: 'pick-the-best-reply',
  kind: 'guideline',
  track: 'delta',
  title: 'Pick the best reply',
  summary: 'The reply guideline in two short chapters: what a good reply looks like, and the traps in the wrong ones.',
  guide: { href: '/prep/replies', label: 'Read the reply guideline' },
  next: { href: '/training', label: 'Start practice' },
  chapters: [
    {
      id: 'good-reply',
      title: 'What a good reply looks like',
      scenes: [
        {
          id: 'intro',
          say: 'When a conversation passes review, you see its last message and four possible replies. Pick the one the other person would really send.',
          visual: { kind: 'title', eyebrow: 'Guideline', title: 'Pick the best', accent: 'reply.' },
        },
        {
          id: 'rules',
          say: 'A good reply answers the last message, not an earlier one. It sounds like a casual text. It has none of the transcript flags, it does not repeat what was already said, and it does not assume the two people are together.',
          visual: {
            kind: 'list',
            title: 'A good reply',
            numbered: true,
            items: ['Answers the last message', 'Sounds like a casual text', 'Has none of the eight flags', 'Does not repeat earlier lines', 'Does not assume they are together'],
          },
        },
        {
          id: 'example',
          say: 'Here the friend asks if the speaker is coming. A short, direct answer is the reply a person would send.',
          visual: {
            kind: 'chat',
            lines: [
              { who: 'Remi', text: 'are you bringing the speaker tonight?' },
              { who: 'Tayo', text: "yes, it's charging now" },
            ],
            verdict: { flag: false, label: 'Good reply' },
          },
        },
      ],
      check: {
        question: 'Which reply fits "what time does the film start?"',
        options: ['What time does the film start?', 'Seven thirty, see you there', 'Films are a popular form of entertainment', 'Hand me the tickets'],
        answer: 1,
        why: 'It answers the question naturally. The others repeat it, sound robotic, or assume you are together.',
      },
    },
    {
      id: 'traps',
      title: 'Spot the traps',
      scenes: [
        {
          id: 'flags',
          say: 'A reply with any transcript flag is out, however good it sounds. An emoji, a misspelled word, or a line that rhymes with the last message all disqualify it.',
          visual: {
            kind: 'compare',
            left: { text: 'yes its charging now 🔊', flag: true, label: 'Out: emoji' },
            right: { text: "yes, it's charging now", flag: false, label: 'Pick this' },
          },
        },
        {
          id: 'repeat-presence',
          say: 'Two quieter traps. A reply that repeats an earlier line adds nothing. And a reply that only works face to face, like pass me the charger, cannot happen over text.',
          visual: {
            kind: 'compare',
            left: { text: 'pass me the charger then', flag: true, label: 'Out: needs them together' },
            right: { text: 'bring the charger too?', flag: false, label: 'Works over text' },
          },
        },
      ],
      check: {
        question: 'Two replies both answer well. One ends with an emoji. Which do you pick?',
        options: ['The one with the emoji, it is friendlier', 'The one without the emoji', 'Either', 'Neither'],
        answer: 1,
        why: 'Any flag disqualifies a reply, so the one without the emoji is the only valid pick.',
      },
    },
  ],
}
