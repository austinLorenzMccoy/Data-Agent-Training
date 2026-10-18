import type { Lesson } from './types'

// Guideline video for /prep/rating. Rules match the Study page and the
// question keys: false, a broken hard instruction, against the request,
// unsafe or a refusal is Bad; a missed part, audience or tone is Okay.
// Examples are written for the video and differ from the question bank.

export const RATE_AI_RESPONSES: Lesson = {
  id: 'rate-ai-responses',
  kind: 'guideline',
  track: 'alpha',
  title: 'Rate AI responses',
  summary: 'The rating guideline in four short chapters: three checks, Good, Okay or Bad, comparing two responses, and a reason that scores.',
  guide: { href: '/prep/rating', label: 'Read the rating guideline' },
  next: { href: '/training', label: 'Start practice' },
  chapters: [
    {
      id: 'three-checks',
      title: 'Three checks',
      scenes: [
        {
          id: 'intro',
          say: 'In these tasks you read what someone asked an AI, read its answer, and rate it Good, Okay or Bad. Every rating comes from three checks.',
          visual: { kind: 'title', eyebrow: 'Guideline', title: 'Rate AI', accent: 'responses.' },
        },
        {
          id: 'checks',
          say: 'One. Is it true, with nothing made up? Two. Does it do what was asked? Three. Is it genuinely useful to this person? Check them in that order.',
          visual: {
            kind: 'list',
            title: 'The three checks, in order',
            numbered: true,
            items: ['Truthful: nothing false or made up', 'Instructions: does what was asked', 'Helpful: useful to this person'],
          },
        },
      ],
      check: {
        question: 'A beautifully written answer gets one fact wrong. Which check does it fail?',
        options: ['Helpfulness', 'Truthfulness', 'None, the writing is good', 'Instruction following'],
        answer: 1,
        why: 'A false claim fails the truth check, however well it is written.',
      },
    },
    {
      id: 'good-okay-bad',
      title: 'Good, Okay or Bad',
      scenes: [
        {
          id: 'bad',
          say: 'Bad means something is wrong. It is false or made up, it breaks a hard instruction like a format, a count, a length limit or a language, it goes against what the user asked, it is unsafe, or it refuses a reasonable request.',
          visual: {
            kind: 'list',
            title: 'Bad: something is wrong',
            items: ['False or made up', 'Breaks a format, count, length or language rule', 'Goes against what was asked', 'Unsafe, or refuses a fair request'],
          },
        },
        {
          id: 'okay',
          say: "Okay means nothing is wrong, but it falls short. It leaves out part of the request, misses the audience or the tone, or stays vague. Good means it passes all three checks.",
          visual: {
            kind: 'list',
            title: 'Okay: nothing wrong, but short of Good',
            items: ['Leaves out part of what was asked', 'Misses the audience or tone', 'Vague or thin'],
          },
        },
        {
          id: 'compare',
          say: 'Compare these. Asked for exactly three tips, an answer with four is Bad: it broke a count. Asked for tips including a budget, an answer that forgets the budget is Okay: it left out a part.',
          visual: {
            kind: 'compare',
            left: { text: '"Give exactly three tips" → four good tips', flag: true, label: 'Bad: count broken' },
            right: { text: '"Tips, including a budget" → good tips, no budget', flag: false, label: 'Okay: a part missing' },
          },
        },
      ],
      check: {
        question: 'The user asks for a numbered list. The answer is correct but written as a paragraph. Rating?',
        options: ['Good', 'Okay', 'Bad', 'It depends on length'],
        answer: 2,
        why: 'A required format is a hard instruction. Breaking it is Bad, even when the content is right.',
      },
    },
    {
      id: 'comparing',
      title: 'Comparing two responses',
      scenes: [
        {
          id: 'rate-each',
          say: 'When you compare two responses, rate each one on its own first. Then pick the better one. The one with the lighter failure wins: Okay beats Bad.',
          visual: { kind: 'rule', icon: 'A|B', title: 'Rate each, then pick', body: 'Rate A and B on their own first. The lighter failure wins.' },
        },
        {
          id: 'example',
          say: 'Here, A sounds confident but invents a detail the user never gave. B is plain but accurate. A is Bad, B is Good, so B wins.',
          visual: {
            kind: 'compare',
            left: { text: 'A: polished, but invents a detail the user never mentioned', flag: true, label: 'A: Bad' },
            right: { text: 'B: plain, accurate, covers every point', flag: false, label: 'B: Good → pick B' },
          },
        },
      ],
      check: {
        question: 'A misses the requested tone. B states a wrong date. Which is better?',
        options: ['A: a missed tone is Okay, a wrong fact is Bad', 'B: it is more confident', 'They tie', 'Neither can be picked'],
        answer: 0,
        why: 'Okay beats Bad. A wrong fact is the heavier failure.',
      },
    },
    {
      id: 'reasons',
      title: 'Writing a reason that scores',
      scenes: [
        {
          id: 'reason-rule',
          say: 'Your written reason is graded from zero to two. Name the exact flaw or strength, say which check it falls under, and keep it to two or three sentences. A reason only earns points when your rating or pick is right.',
          visual: {
            kind: 'list',
            title: 'A reason that scores',
            numbered: true,
            items: ['Name the exact flaw or strength', 'Say which check it falls under', 'Two or three sentences', 'Only counts when your call is right'],
          },
        },
        {
          id: 'weak-strong',
          say: 'Compare these. The weak one could describe any response. The strong one names the invented detail and the check it fails.',
          visual: {
            kind: 'compare',
            left: { text: '"B is better because it is more accurate and helpful."', flag: true, label: 'Weak: scores 0' },
            right: { text: '"A invents a refund policy the user never mentioned, a truthfulness failure. B covers every point accurately."', flag: false, label: 'Strong: scores 2' },
          },
        },
      ],
      check: {
        question: 'You pick the wrong response but write a detailed reason. What does the reason score?',
        options: ['2', '1', '0', 'Depends on length'],
        answer: 2,
        why: 'Reasons only count when the call itself is right.',
      },
    },
  ],
}
